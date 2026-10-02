"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { completeLevel } from "@/lib/storage";
import { useHudStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useSimulation } from "@/scene/SimulationContext";

export function GameLoop() {
  const sim = useSimulation();
  const { step, world } = useRapier();
  const physicsReady = useRef(false);

  useEffect(() => {
    sim.setPublisher((hud) => useHudStore.getState().setHud(hud));
    const detachInput = sim.attachInput(window);
    const stopComplete = sim.events.on("LEVEL_COMPLETED", (payload) => {
      completeLevel(payload.levelId, payload.elapsed, sim.level.nextLevelId);
      if (document.pointerLockElement) document.exitPointerLock();
    });
    useHudStore.getState().setReady(true);
    return () => {
      stopComplete();
      detachInput();
      useHudStore.getState().setReady(false);
      sim.dispose();
    };
  }, [sim]);

  useFrame((_, dt) => {
    const settings = useSettingsStore.getState();
    sim.applySettings({
      sensitivity: settings.mouseSensitivity,
      invertY: settings.invertY,
      reduceMotion: settings.reduceMotion || settings.reduceTemporalDistortion,
    });
    const phase = sim.beginFrame(dt);
    const stepDt = sim.frameDelta;
    if (phase === "simulate") {
      if (!physicsReady.current && sim.registry.get("player")) {
        step(1 / 60);
        physicsReady.current = true;
      }
      sim.prePhysics(stepDt);
      step(stepDt);
      sim.postPhysics(stepDt);
    } else if (phase === "rewind") {
      sim.applyRewind(stepDt);
    }
    if (sim.consumeColliderSync()) {
      world.propagateModifiedBodyPositionsToColliders();
    }
    if (
      (sim.gameState === "PAUSED" || sim.gameState === "LEVEL_COMPLETE") &&
      document.pointerLockElement
    ) {
      document.exitPointerLock();
    }
    const stats = sim.stats;
    sim.setDebugText(
      [
        `FPS ${stats.fps.toFixed(0)}`,
        `frame ${stats.frameMs.toFixed(1)} ms`,
        `snapshots ${stats.snapshots}`,
        `entities ${stats.entities}`,
        `time ${stats.time.toFixed(2)}`,
        `mode ${stats.mode}`,
        `energy ${stats.energy.toFixed(0)}`,
        `colliders ${stats.colliders ? "on" : "off"}`,
        sim.level.id,
      ].join("\n"),
    );
  }, -100);

  return null;
}
