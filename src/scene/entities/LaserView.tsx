"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { MeshStandardMaterial } from "three";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import { beamBlocks, beamX } from "@/game/levels/motion";
import type { EntityDefinition } from "@/game/levels/types";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { FollowBody } from "@/scene/runtime/FollowBody";
import { createBridge, spawnRotation, writeBody, type BodyBridge } from "@/scene/runtime/body";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

class LaserEntity implements SimEntity {
  readonly kind = "laser";
  readonly rewindable = true;
  age = 0;
  hot = true;
  beam = 0;

  constructor(
    readonly id: string,
    private readonly origin: Vec3,
    private readonly amplitude: number,
    private readonly omega: number,
    private readonly reach: number,
    private readonly half: readonly [number, number, number],
    private readonly bridge: BodyBridge,
    private readonly scale: () => number,
    private readonly player: () => SimEntity | undefined,
    private readonly spawn: Vec3,
  ) {}

  captureState(): EntityState {
    return makeEntityState(this.pose(), { age: this.age, hot: this.hot, beam: this.beam });
  }

  restoreState(state: EntityState, visual: boolean): void {
    this.age = typeof state.custom.age === "number" ? state.custom.age : 0;
    this.beam = typeof state.custom.beam === "number" ? state.custom.beam : beamX(this.age, this.amplitude, this.omega);
    this.hot = state.custom.hot === true;
    this.place(visual);
  }

  reset(): void {
    this.age = 0;
    this.beam = 0;
    this.hot = true;
    this.place(true);
  }

  setActive(active: boolean): void {
    if (this.bridge.object) this.bridge.object.visible = active;
  }

  prePhysics(dt: number): void {
    this.age += dt * this.scale();
    this.beam = beamX(this.age, this.amplitude, this.omega);
    this.hot = beamBlocks(this.beam, this.reach);
    this.place(false);
  }

  postPhysics(): void {
    if (!this.hot) return;
    const rider = this.player();
    const position = rider?.getPosition?.();
    if (!position || !rider?.placeAt) return;
    const [sx, sy, sz] = this.half;
    const center = this.pose();
    const inside =
      Math.abs(position[0] - center[0]) < sx + 0.32 &&
      Math.abs(position[1] - center[1]) < sy + 0.4 &&
      Math.abs(position[2] - center[2]) < sz + 0.32;
    if (inside) rider.placeAt(this.spawn);
  }

  private pose(): Vec3 {
    return [this.origin[0] + this.beam, this.origin[1], this.origin[2]];
  }

  private place(visual: boolean): void {
    writeBody(this.bridge, this.pose(), spawnRotation(), visual, true);
  }
}

export function LaserView({ def }: { def: Extract<EntityDefinition, { type: "laser-gate" }> }) {
  const sim = useSimulation();
  const bodyRef = useRef<RapierRigidBody>(null);
  const glow = useRef<MeshStandardMaterial>(null);
  const [bridge] = useState(createBridge);
  const [sx, sy, sz] = def.size;

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    bridge.body = body;
    const entity = new LaserEntity(
      def.id,
      def.position,
      def.amplitude,
      def.omega,
      def.reach,
      [sx / 2, sy / 2, sz / 2],
      bridge,
      () => sim.timeScale(true),
      () => sim.registry.get("player"),
      sim.level.spawn,
    );
    sim.registry.register(entity);
    return () => {
      sim.registry.unregister(entity.id);
      bridge.body = null;
    };
  }, [bridge, def.amplitude, def.id, def.omega, def.position, def.reach, sim, sx, sy, sz]);

  useFrame(() => {
    const material = glow.current;
    const entity = sim.registry.get(def.id);
    if (!material || !entity || entity.kind !== "laser") return;
    const laser = entity as LaserEntity;
    const frozen = sim.localPauseLeft > 0;
    material.color.set(frozen ? theme.amber : theme.cyan);
    material.emissive.set(frozen ? theme.amber : theme.cyan);
    material.emissiveIntensity = frozen ? 2.4 : laser.hot ? 1.6 : 0.35;
    material.opacity = laser.hot || frozen ? 0.92 : 0.28;
  });

  return (
    <>
      <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={def.position} sensor>
        <CuboidCollider args={[sx / 2, sy / 2, sz / 2]} sensor collisionGroups={collisionGroups.sensor} />
      </RigidBody>
      <FollowBody bodyRef={bodyRef} position={def.position}>
        <mesh>
          <boxGeometry args={def.size} />
          <meshStandardMaterial
            ref={glow}
            color={theme.cyan}
            emissive={theme.cyan}
            emissiveIntensity={1.6}
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </mesh>
      </FollowBody>
    </>
  );
}
