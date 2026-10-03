import { findEntity, type LevelDefinition } from "@/game/levels/types";
import { doorShouldOpen, pickInteractable, playerInZone } from "@/game/levels/logic";
import { EventBus } from "@/game/events/EventBus";
import { EntityRegistry } from "@/game/entities/EntityRegistry";
import { isDoor } from "@/game/entities/RewindableEntity";
import { InputManager, emptyInput, type InputFrame } from "@/game/player/PlayerInput";
import { TimeController } from "@/game/time/TimeController";
import type { InterpolatedWorld } from "@/game/time/types";
import { noopAudio, type AudioSink } from "@/game/audio/AudioSink";
import { cameraOffset, clamp, clampDelta } from "@/lib/math";
import { gameConfig, playerConfig } from "./GameConfig";
import type { GameState } from "./GameState";
import type { DebugStats, HudModel } from "./hud";
import type { Vec3 } from "@/game/time/types";

export type FramePhase = "idle" | "simulate" | "rewind";

export interface LookSettings {
  sensitivity: number;
  invertY: boolean;
  reduceMotion: boolean;
}

/**
 * Client simulation. React renders it; React state is not the simulation.
 * Physics is stepped by the render bridge only when this returns "simulate".
 */
export class Simulation {
  readonly registry = new EntityRegistry();
  readonly events = new EventBus();
  readonly time: TimeController;
  readonly level: LevelDefinition;
  readonly stats: DebugStats = {
    fps: 0,
    frameMs: 0,
    snapshots: 0,
    entities: 0,
    time: 0,
    mode: "NORMAL",
    energy: gameConfig.rewindEnergyMax,
    colliders: false,
  };

  audio: AudioSink = noopAudio;
  gameState: GameState = "BOOT";
  camera: { yaw: number; pitch: number; distance: number } = {
    yaw: 0,
    pitch: playerConfig.cameraPitch,
    distance: playerConfig.cameraDistance,
  };
  input: InputFrame = emptyInput();
  settings: LookSettings = { sensitivity: 1, invertY: false, reduceMotion: false };
  needsColliderSync = false;
  private debugElement: HTMLElement | null = null;
  readonly devTools = process.env.NODE_ENV !== "production";

  private readonly inputManager = new InputManager();
  private booted = false;
  private simTime = 0;
  private elapsed = 0;
  private rewindUsed = 0;
  private snapshotAcc = 0;
  private objectiveTimer = 8;
  private hintIndex = -1;
  private prompt: string | null = null;
  private debugOpen = false;
  private fpsSmoothed = 60;
  private lastSignature = "";
  private publisher: (hud: HudModel) => void = () => {};

  constructor(level: LevelDefinition) {
    this.level = level;
    this.time = new TimeController();
    this.camera.yaw = level.spawnYaw;
  }

  attachInput(target: Window): () => void {
    this.inputManager.attach(target);
    return () => this.inputManager.detach();
  }

  setPublisher(publisher: (hud: HudModel) => void): void {
    this.publisher = publisher;
    this.publish(true);
  }

  applySettings(settings: LookSettings): void {
    this.settings = settings;
  }

  frameDelta = 0;
  /** Seconds left in a local pause. Tagged hazards read this as a time scale of zero. */
  localPauseLeft = 0;

  beginFrame(rawDt: number): FramePhase {
    const dt = clampDelta(rawDt, gameConfig.minDelta, gameConfig.maxDelta);
    this.frameDelta = dt;
    this.trackFrame(dt);
    this.input = this.inputManager.read();
    this.applyLook(this.input);

    if (this.input.restart) {
      this.reset();
      return "idle";
    }
    if (this.input.pause && this.gameState !== "LEVEL_COMPLETE") {
      this.togglePause();
      return "idle";
    }
    if (this.input.hint) this.cycleHint();
    if (this.devTools && this.input.debugToggle) {
      this.debugOpen = !this.debugOpen;
      this.publish(true);
    }
    if (this.devTools && this.input.toggleColliders) {
      this.stats.colliders = !this.stats.colliders;
    }
    if (this.devTools && this.input.refill) this.time.refill();

    if (!this.registry.hasAll(this.level.requiredEntities)) return "idle";
    if (!this.booted) this.boot();

    if (this.gameState === "PAUSED" || this.gameState === "LEVEL_COMPLETE") {
      this.publish();
      return "idle";
    }

    if (this.input.localPause) this.beginLocalPause();
    this.syncFastForward();

    if (this.time.mode === "REWINDING") {
      if (!this.input.rewind || this.time.energy <= 0 || this.time.atOldest()) {
        this.finishRewind();
        return "idle";
      }
      return "rewind";
    }

    if (this.input.rewind && this.canStartRewind()) {
      this.startRewind();
      return "rewind";
    }

    return "simulate";
  }

  prePhysics(dt: number): void {
    this.registry.prePhysics(dt);
  }

  postPhysics(dt: number): void {
    this.registry.postPhysics(dt);
    this.evaluateLinks();
    this.clockForward(dt);
    this.captureSnapshot(dt);
    this.updateInteraction();
    this.checkCompletion();
    this.publish();
  }

  applyRewind(dt: number): void {
    const before = this.time.playbackTime;
    const sample = this.time.rewind(dt);
    this.rewindUsed += Math.max(0, before - this.time.playbackTime);
    if (sample) this.registry.restore(sample.entities, true);
    this.needsColliderSync = true;
    this.publish();
    if (this.time.energy <= 0) this.finishRewind();
  }

  setDebugElement(element: HTMLElement | null): void {
    this.debugElement = element;
  }

  setDebugText(text: string): void {
    if (this.debugElement) this.debugElement.textContent = text;
  }

  consumeColliderSync(): boolean {
    const pending = this.needsColliderSync;
    this.needsColliderSync = false;
    return pending;
  }

  ghostFrames(): InterpolatedWorld[] {
    if (this.time.mode !== "REWINDING" || this.settings.reduceMotion) return [];
    const frames: InterpolatedWorld[] = [];
    for (const offset of [0.14, 0.3, 0.48]) {
      const sample = this.time.sampleAt(this.time.playbackTime + offset);
      if (sample) frames.push(sample);
    }
    return frames;
  }

  reset(): void {
    this.registry.resetAll();
    this.simTime = 0;
    this.elapsed = 0;
    this.rewindUsed = 0;
    this.localPauseLeft = 0;
    this.snapshotAcc = 0;
    this.objectiveTimer = 8;
    this.hintIndex = -1;
    this.prompt = null;
    this.gameState = "PLAYING";
    this.time.reset(this.registry.capture(0));
    this.needsColliderSync = true;
    this.audio.setRewindActive(false);
    this.audio.play("ui");
    this.events.emit("LEVEL_RESTARTED", { levelId: this.level.id });
    this.booted = true;
    this.publish(true);
  }

  togglePause(): void {
    if (this.gameState === "PLAYING" || this.gameState === "BOOT") {
      this.gameState = "PAUSED";
      this.publish(true);
      return;
    }
    if (this.gameState === "PAUSED") {
      this.gameState = "PLAYING";
      this.publish(true);
    }
  }

  dispose(): void {
    this.inputManager.detach();
    this.registry.clear();
    this.events.clear();
    this.audio.setRewindActive(false);
    this.audio.stopMusic();
  }

  private boot(): void {
    this.booted = true;
    this.gameState = "PLAYING";
    this.simTime = 0;
    this.elapsed = 0;
    this.rewindUsed = 0;
    this.time.reset(this.registry.capture(0));
    this.audio.startMusic();
    this.publish(true);
  }

  private canStartRewind(): boolean {
    return (
      this.time.mode === "NORMAL" &&
      this.time.energy > 0 &&
      this.simTime > this.time.store.oldestTime() + 1e-3
    );
  }

  private startRewind(): void {
    this.localPauseLeft = 0;
    this.time.record(this.registry.capture(this.simTime));
    this.snapshotAcc = 0;
    this.time.beginRewind();
    this.registry.onRewindStart();
    this.audio.play("rewind-start");
    this.audio.setRewindActive(true);
    this.events.emit("REWIND_STARTED", { time: this.time.playbackTime });
    this.publish(true);
  }

  private finishRewind(): void {
    if (this.time.mode !== "REWINDING") return;
    const sample = this.time.sample();
    this.simTime = this.time.commitBranch();
    if (sample) {
      this.registry.restore(sample.entities, true);
      this.registry.onRewindEnd(sample.entities);
    }
    this.snapshotAcc = 0;
    this.time.record(this.registry.capture(this.simTime));
    this.needsColliderSync = true;
    this.audio.setRewindActive(false);
    this.audio.play("rewind-stop");
    this.events.emit("REWIND_ENDED", { time: this.simTime });
    this.publish(true);
  }

  private evaluateLinks(): void {
    for (const entity of this.registry.all()) {
      if (!isDoor(entity)) continue;
      const signals = entity.linkedTo.map((id) => this.registry.signal(id));
      entity.setOpenTarget(doorShouldOpen(signals));
    }
  }

  /**
   * Authored mechanisms opt into pause or fast-forward. Everything else,
   * including the player and Rapier, stays at normal speed.
   */
  timeScale(channel: "normal" | "pause" | "fast" = "normal"): number {
    if (channel === "pause" && this.localPauseLeft > 0) return 0;
    if (channel === "fast" && this.time.mode === "FAST_FORWARDING") return gameConfig.fastForwardScale;
    return 1;
  }

  private syncFastForward(): void {
    const hold =
      this.input.fastForward &&
      !this.input.rewind &&
      this.level.requiredAbilities.includes("fast-forward") &&
      this.gameState === "PLAYING" &&
      this.time.mode !== "REWINDING" &&
      this.time.energy > 0;
    if (hold && this.time.mode === "NORMAL") this.time.mode = "FAST_FORWARDING";
    else if (!hold && this.time.mode === "FAST_FORWARDING") this.time.mode = "NORMAL";
  }

  private beginLocalPause(): void {
    if (!this.level.requiredAbilities.includes("local-pause")) return;
    if (this.time.mode !== "NORMAL" || this.gameState !== "PLAYING") return;
    if (this.localPauseLeft > 0) return;
    this.localPauseLeft = gameConfig.localPauseDuration;
    this.audio.play("ui");
    this.publish(true);
  }

  private clockForward(dt: number): void {
    this.simTime += dt;
    this.elapsed += dt;
    this.objectiveTimer = Math.max(0, this.objectiveTimer - dt);
    if (this.localPauseLeft > 0) this.localPauseLeft = Math.max(0, this.localPauseLeft - dt);
    if (this.time.mode === "FAST_FORWARDING") {
      this.time.energy = Math.max(0, this.time.energy - dt * gameConfig.fastForwardDrain);
      if (this.time.energy <= 0) this.time.mode = "NORMAL";
    }
  }

  private captureSnapshot(dt: number): void {
    this.snapshotAcc += dt;
    const interval = 1 / gameConfig.snapshotRate;
    if (this.snapshotAcc < interval) return;
    this.time.record(this.registry.capture(this.simTime));
    this.snapshotAcc %= interval;
    if (this.snapshotAcc > interval) this.snapshotAcc = 0;
  }

  private updateInteraction(): void {
    const player = this.registry.get("player");
    const position = player?.getPosition?.();
    if (!position) {
      this.prompt = null;
      return;
    }

    const offset = cameraOffset(this.camera.yaw, this.camera.pitch, this.camera.distance);
    const origin: Vec3 = [position[0] + offset.x, position[1] + offset.y, position[2] + offset.z];
    const look: Vec3 = [position[0], playerConfig.lookHeight, position[2]];
    const direction: Vec3 = [look[0] - origin[0], look[1] - origin[1], look[2] - origin[2]];
    const candidates = this.registry.all().flatMap((entity) => {
      if (!entity.interactPrompt || !entity.interact) return [];
      const prompt = entity.interactPrompt();
      if (!prompt) return [];
      const interactPosition = entity.getInteractPosition?.() ?? entity.getPosition?.();
      if (!interactPosition) return [];
      return [{ id: entity.id, position: interactPosition, prompt, enabled: true }];
    });

    const picked = pickInteractable(
      position,
      origin,
      direction,
      candidates,
      gameConfig.interactionDistance,
      gameConfig.interactionRaySlop,
    );
    this.prompt = picked ? `[E] ${picked.prompt}` : null;
    if (this.input.interact && picked) {
      this.registry.get(picked.id)?.interact?.();
    }
  }

  private checkCompletion(): void {
    if (this.gameState !== "PLAYING") return;
    const zone = findEntity(this.level, "exit-zone");
    const position = this.registry.get("player")?.getPosition?.();
    if (!zone || !position) return;
    if (!playerInZone(position, zone.position, zone.halfExtents)) return;
    this.gameState = "LEVEL_COMPLETE";
    const completion = { elapsed: this.elapsed, rewindUsed: this.rewindUsed };
    this.audio.play("success");
    this.events.emit("LEVEL_COMPLETED", {
      levelId: this.level.id,
      elapsed: completion.elapsed,
      rewindUsed: completion.rewindUsed,
    });
    this.publish(true);
  }

  private applyLook(frame: InputFrame): void {
    if (this.gameState === "PAUSED" || this.gameState === "LEVEL_COMPLETE") return;
    const sensitivity = playerConfig.cameraSensitivity * this.settings.sensitivity;
    this.camera.yaw -= frame.lookX * sensitivity;
    const pitchSign = this.settings.invertY ? 1 : -1;
    this.camera.pitch = clamp(
      this.camera.pitch + frame.lookY * sensitivity * pitchSign,
      playerConfig.cameraPitchMin,
      playerConfig.cameraPitchMax,
    );
  }

  private cycleHint(): void {
    const count = this.level.hints.length;
    this.hintIndex = this.hintIndex >= count - 1 ? -1 : this.hintIndex + 1;
    this.publish(true);
  }

  private trackFrame(dt: number): void {
    if (dt > 0) this.fpsSmoothed = this.fpsSmoothed * 0.92 + (1 / dt) * 0.08;
    this.stats.fps = this.fpsSmoothed;
    this.stats.frameMs = dt * 1000;
    this.stats.snapshots = this.time.store.length;
    this.stats.entities = this.registry.size;
    this.stats.time = this.time.mode === "REWINDING" ? this.time.playbackTime : this.simTime;
    this.stats.mode = this.time.mode;
    this.stats.energy = this.time.energy;
  }

  private hud(): HudModel {
    return {
      gameState: this.gameState,
      timeMode: this.time.mode,
      rewindEnergy: this.time.energy,
      localPause: this.localPauseLeft,
      prompt: this.prompt,
      hint: this.hintIndex >= 0 ? (this.level.hints[this.hintIndex] ?? null) : null,
      objective: this.level.objective,
      showObjective: this.gameState === "PLAYING" || this.objectiveTimer > 0,
      levelId: this.level.id,
      levelName: this.level.name,
      levelNumber: this.level.number,
      completion:
        this.gameState === "LEVEL_COMPLETE"
          ? { elapsed: this.elapsed, rewindUsed: this.rewindUsed }
          : null,
      debugOpen: this.debugOpen,
    };
  }

  private publish(force = false): void {
    const energy = Math.round(this.time.energy);
    const signature = [
      this.gameState,
      this.time.mode,
      energy,
      Math.ceil(this.localPauseLeft * 10),
      this.prompt,
      this.hintIndex,
      this.objectiveTimer > 0 ? "1" : "0",
      this.debugOpen ? "1" : "0",
    ].join("|");
    if (!force && signature === this.lastSignature) return;
    this.lastSignature = signature;
    this.publisher(this.hud());
  }
}
