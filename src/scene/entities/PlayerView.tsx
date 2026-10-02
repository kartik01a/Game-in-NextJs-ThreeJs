"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from "@react-three/rapier";
import { QueryFilterFlags, type KinematicCharacterController } from "@dimforge/rapier3d-compat";
import { playerConfig, theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import { accelerateSpeed, animationFor, stepVertical, type PlayerAnim } from "@/game/player/PlayerMotor";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { wishVector } from "@/lib/math";
import { useSimulation } from "@/scene/SimulationContext";
import { FollowBody } from "@/scene/runtime/FollowBody";
import { createBridge, readBody, spawnRotation, writeBody, zeroVelocity, type BodyBridge } from "@/scene/runtime/body";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

const ANIMS: readonly PlayerAnim[] = ["idle", "walk", "run", "jump", "fall"];

function isAnim(value: unknown): value is PlayerAnim {
  return typeof value === "string" && ANIMS.includes(value as PlayerAnim);
}

class PlayerEntity implements SimEntity {
  readonly id = "player";
  readonly kind = "player";
  rewindable: boolean;
  vy = 0;
  coyote: number = playerConfig.coyoteTime;
  grounded = true;
  speed = 0;
  anim: PlayerAnim = "idle";
  private stepTimer = 0.2;

  constructor(
    private readonly spawn: Vec3,
    private readonly bridge: BodyBridge,
    private readonly getController: () => KinematicCharacterController | null,
    private readonly getInput: () => { moveX: number; moveZ: number; sprint: boolean; jump: boolean },
    private readonly getYaw: () => number,
    private readonly play: (id: "jump" | "land" | "step") => void,
  ) {
    this.rewindable = true;
  }

  setRewindable(value: boolean): void {
    this.rewindable = value;
  }

  captureState(): EntityState {
    const pose = this.bridge.body
      ? readBody(this.bridge.body)
      : {
          position: this.spawn,
          rotation: spawnRotation(),
          linear: [0, this.vy, 0] as Vec3,
          angular: [0, 0, 0] as Vec3,
        };
    return makeEntityState(
      pose.position,
      {
        verticalVelocity: this.vy,
        grounded: this.grounded,
        speed: this.speed,
        anim: this.anim,
        coyote: this.coyote,
      },
      pose.rotation,
      [pose.linear[0], this.vy, pose.linear[2]],
      pose.angular,
    );
  }

  restoreState(state: EntityState, visual: boolean): void {
    this.vy = typeof state.custom.verticalVelocity === "number" ? state.custom.verticalVelocity : 0;
    this.grounded = state.custom.grounded === true;
    this.speed = typeof state.custom.speed === "number" ? state.custom.speed : 0;
    this.coyote = typeof state.custom.coyote === "number" ? state.custom.coyote : 0;
    this.anim = isAnim(state.custom.anim) ? state.custom.anim : "idle";
    writeBody(this.bridge, state.position, state.rotation, visual, true);
  }

  reset(): void {
    this.vy = 0;
    this.coyote = playerConfig.coyoteTime;
    this.grounded = true;
    this.speed = 0;
    this.anim = "idle";
    writeBody(this.bridge, this.spawn, spawnRotation(), true, true);
    if (this.bridge.body) zeroVelocity(this.bridge.body);
  }

  setActive(active: boolean): void {
    if (this.bridge.object) this.bridge.object.visible = active;
  }

  getPosition(): Vec3 {
    return this.bridge.body ? readBody(this.bridge.body).position : this.spawn;
  }

  onRewindStart(): void {
    if (this.bridge.body) zeroVelocity(this.bridge.body);
  }

  onRewindEnd(state: EntityState | undefined): void {
    const vertical = state?.custom.verticalVelocity;
    this.vy = typeof vertical === "number" ? vertical : this.vy;
  }

  prePhysics(dt: number): void {
    const body = this.bridge.body;
    const controller = this.getController();
    if (!body || !controller || body.numColliders() < 1) return;
    const currentPose = body.translation();
    if (currentPose.y < this.spawn[1] - 1.25) {
      this.vy = 0;
      this.speed = 0;
      this.grounded = true;
      const home = { x: this.spawn[0], y: this.spawn[1], z: this.spawn[2] };
      body.setTranslation(home, true);
      body.setNextKinematicTranslation(home);
      return;
    }
    const input = this.getInput();
    const wish = wishVector(input.moveX, input.moveZ, this.getYaw());
    const moving = Math.abs(input.moveX) + Math.abs(input.moveZ) > 0;
    const target = moving
      ? playerConfig.walkSpeed * (input.sprint ? playerConfig.sprintMultiplier : 1)
      : 0;
    this.speed = accelerateSpeed(this.speed, target, dt);
    const vertical = stepVertical(
      { vy: this.vy, coyote: this.coyote, grounded: this.grounded },
      input.jump,
      dt,
    );
    this.vy = vertical.vy;
    this.coyote = vertical.coyote;
    if (vertical.jumped) this.play("jump");
    if (this.vy > 0) controller.disableSnapToGround();
    else controller.enableSnapToGround(0.28);

    controller.computeColliderMovement(
      body.collider(0),
      { x: wish.x * this.speed * dt, y: this.vy * dt, z: wish.z * this.speed * dt },
      QueryFilterFlags.EXCLUDE_SENSORS,
    );
    const movement = controller.computedMovement();
    const current = body.translation();
    body.setNextKinematicTranslation({
      x: current.x + movement.x,
      y: current.y + movement.y,
      z: current.z + movement.z,
    });
    const wasGrounded = this.grounded;
    this.grounded = controller.computedGrounded();
    if (!wasGrounded && this.grounded && this.vy < -3.2) this.play("land");
    if (this.grounded && this.vy < 0) this.vy = 0;
    this.anim = animationFor(this.speed, this.grounded, this.vy);
    if (this.anim === "walk" || this.anim === "run") {
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.play("step");
        this.stepTimer = this.anim === "run" ? 0.28 : 0.42;
      }
    } else {
      this.stepTimer = 0.16;
    }
  }
}

export function PlayerView() {
  const sim = useSimulation();
  const { world } = useRapier();
  const bodyRef = useRef<RapierRigidBody>(null);
  const [bridge] = useState(createBridge);
  const avatar = useRef<Group>(null);
  const bob = useRef(0);

  useEffect(() => {
    let controller: KinematicCharacterController | null = null;
    const body = bodyRef.current;
    if (!body) return;
    bridge.body = body;
    const [spawnX, spawnY, spawnZ] = sim.level.spawn;
    body.setTranslation({ x: spawnX, y: spawnY, z: spawnZ }, true);
    body.setNextKinematicTranslation({ x: spawnX, y: spawnY, z: spawnZ });
    controller = world.createCharacterController(0.02);
    controller.setApplyImpulsesToDynamicBodies(true);
    controller.setCharacterMass(65);
    controller.enableAutostep(0.3, 0.18, false);
    controller.enableSnapToGround(0.28);
    controller.setSlideEnabled(true);
    controller.setMaxSlopeClimbAngle(Math.PI / 4);
    const entity = new PlayerEntity(
      sim.level.spawn,
      bridge,
      () => controller,
      () => sim.input,
      () => sim.camera.yaw,
      (id) => sim.audio.play(id),
    );
    entity.setRewindable(sim.level.rewindPlayer);
    sim.registry.register(entity);
    return () => {
      sim.registry.unregister(entity.id);
      if (controller) world.removeCharacterController(controller);
      bridge.body = null;
    };
  }, [bridge, sim, world]);

  useFrame((_, dt) => {
    const entity = sim.registry.get("player");
    const rig = avatar.current;
    if (!rig || !entity || entity.kind !== "player") return;
    const player = entity as PlayerEntity;
    rig.rotation.y = sim.camera.yaw;
    if (sim.time.mode === "REWINDING") return;
    const rate = player.anim === "run" ? 14 : player.anim === "walk" ? 9 : 2.2;
    bob.current += dt * rate;
    const amount = player.anim === "idle" ? 0.015 : 0.045;
    rig.position.y = Math.sin(bob.current) * amount;
  });

  return (
    <>
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={sim.level.spawn}
      enabledRotations={[false, false, false]}
      gravityScale={0}
      lockRotations
    >
      <CapsuleCollider
        args={[playerConfig.capsuleHalfHeight, playerConfig.capsuleRadius]}
        collisionGroups={collisionGroups.player}
        friction={0.15}
      />
    </RigidBody>
    <FollowBody bodyRef={bodyRef} position={sim.level.spawn}>
      <group ref={avatar}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <capsuleGeometry args={[0.28, 0.62, 6, 10]} />
          <meshStandardMaterial color={"#3d4c63"} roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.48, 0.08]} castShadow>
          <boxGeometry args={[0.34, 0.16, 0.22]} />
          <meshStandardMaterial
            color={"#0e141c"}
            emissive={theme.cyan}
            emissiveIntensity={0.85}
            roughness={0.25}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[0, -0.42, 0.02]}>
          <boxGeometry args={[0.34, 0.12, 0.28]} />
          <meshStandardMaterial color={"#121820"} roughness={0.7} />
        </mesh>
      </group>
    </FollowBody>
    </>
  );
}
