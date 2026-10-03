"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import { shuttleZ } from "@/game/levels/motion";
import type { EntityDefinition } from "@/game/levels/types";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { FollowBody } from "@/scene/runtime/FollowBody";
import { createBridge, spawnRotation, writeBody, type BodyBridge } from "@/scene/runtime/body";
import { collisionGroups } from "@/scene/runtime/physicsGroups";
import { markShuttle } from "@/scene/runtime/shuttleColliders";

class ShuttleEntity implements SimEntity {
  readonly kind = "shuttle";
  readonly rewindable = true;
  age = 0;

  constructor(
    readonly id: string,
    private readonly origin: Vec3,
    private readonly south: number,
    private readonly north: number,
    private readonly speed: number,
    private readonly dwell: number,
    private readonly half: readonly [number, number, number],
    private readonly bridge: BodyBridge,
    private readonly player: () => SimEntity | undefined,
    private readonly scale: () => number,
  ) {}

  captureState(): EntityState {
    return makeEntityState(this.pose(), { age: this.age });
  }

  restoreState(state: EntityState, visual: boolean): void {
    this.age = typeof state.custom.age === "number" ? state.custom.age : 0;
    this.place(visual);
  }

  reset(): void {
    this.age = 0;
    this.place(true);
  }

  setActive(active: boolean): void {
    if (this.bridge.object) this.bridge.object.visible = active;
  }

  prePhysics(dt: number): void {
    const before = this.pose();
    this.age += dt * this.scale();
    const after = this.pose();
    this.place(false);
    this.carry([after[0] - before[0], after[1] - before[1], after[2] - before[2]], before);
  }

  private pose(): Vec3 {
    return [this.origin[0], this.origin[1], shuttleZ(this.age, this.south, this.north, this.speed, this.dwell)];
  }

  private place(visual: boolean): void {
    writeBody(this.bridge, this.pose(), spawnRotation(), visual, true);
  }

  private carry(delta: Vec3, pose: Vec3): void {
    const rider = this.player();
    const position = rider?.getPosition?.();
    if (!rider || !position || !rider.ride) return;
    const [hx, , hz] = this.half;
    const deckTop = pose[1] + this.half[1];
    const onDeck =
      Math.abs(position[0] - pose[0]) < hx - 0.05 &&
      Math.abs(position[2] - pose[2]) < hz - 0.05 &&
      position[1] > deckTop + 0.15 &&
      position[1] < deckTop + 1.25;
    if (onDeck) rider.ride?.(delta, deckTop);
  }
}

export function ShuttleView({ def }: { def: Extract<EntityDefinition, { type: "shuttle" }> }) {
  const sim = useSimulation();
  const bodyRef = useRef<RapierRigidBody>(null);
  const [bridge] = useState(createBridge);
  const [sx, sy, sz] = def.size;
  const stripe = useRef<MeshStandardMaterial>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    bridge.body = body;
    if (body.numColliders() > 0) markShuttle(body.collider(0));
    const entity = new ShuttleEntity(
      def.id,
      def.position,
      def.south,
      def.north,
      def.speed,
      def.dwell,
      [sx / 2, sy / 2, sz / 2],
      bridge,
      () => sim.registry.get("player"),
      () => sim.timeScale(def.fast ? "fast" : "normal"),
    );
    sim.registry.register(entity);
    return () => {
      sim.registry.unregister(entity.id);
      bridge.body = null;
    };
  }, [bridge, def.dwell, def.fast, def.id, def.north, def.position, def.south, def.speed, sim, sx, sy, sz]);

  useFrame(() => {
    const material = stripe.current;
    if (!material || !def.fast) return;
    const hasting = sim.time.mode === "FAST_FORWARDING";
    material.color.set(hasting ? theme.temporal : theme.cyan);
    material.emissive.set(hasting ? theme.temporal : theme.cyan);
    material.emissiveIntensity = hasting ? 1.8 : 0.45;
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        colliders={false}
        position={def.position}
        collisionGroups={collisionGroups.world}
        userData={{ kind: "shuttle" }}
      >
        <CuboidCollider args={[sx / 2, sy / 2, sz / 2]} collisionGroups={collisionGroups.world} />
      </RigidBody>
      <FollowBody bodyRef={bodyRef} position={def.position}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={def.size} />
          <meshStandardMaterial color={"#243044"} metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, sy / 2 + 0.01, 0]}>
          <boxGeometry args={[sx * 0.92, 0.02, sz * 0.92]} />
          <meshStandardMaterial ref={stripe} color={theme.cyan} emissive={theme.cyan} emissiveIntensity={0.45} />
        </mesh>
      </FollowBody>
    </>
  );
}
