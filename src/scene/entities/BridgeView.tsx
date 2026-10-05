"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ConvexHullCollider, CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { Group, MeshStandardMaterial } from "three";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import { markShuttle } from "@/scene/runtime/shuttleColliders";
import type { EntityDefinition } from "@/game/levels/types";
import { approach } from "@/game/levels/logic";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { FollowBody } from "@/scene/runtime/FollowBody";
import { createBridge, spawnRotation, writeBody, type BodyBridge } from "@/scene/runtime/body";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

class BridgeEntity implements SimEntity {
  readonly kind = "bridge";
  readonly rewindable = true;
  armed = false;
  age = 0;
  progress = 0;

  constructor(
    readonly id: string,
    private readonly origin: Vec3,
    private readonly collapseAt: number,
    private readonly drop: number,
    private readonly armZone: readonly [number, number],
    private readonly half: Vec3,
    private readonly carryRider: boolean,
    private readonly bridge: BodyBridge,
    private readonly player: () => SimEntity | undefined,
  ) {}

  captureState(): EntityState {
    return makeEntityState(this.pose(), { armed: this.armed, age: this.age, progress: this.progress });
  }

  restoreState(state: EntityState, visual: boolean): void {
    this.armed = state.custom.armed === true;
    this.age = typeof state.custom.age === "number" ? state.custom.age : 0;
    this.progress = typeof state.custom.progress === "number" ? state.custom.progress : 0;
    this.place(visual);
  }

  reset(): void {
    this.armed = false;
    this.age = 0;
    this.progress = 0;
    this.place(true);
  }

  setActive(active: boolean): void {
    if (this.bridge.object) this.bridge.object.visible = active;
  }

  prePhysics(dt: number): void {
    const before = this.pose();
    const rider = this.player();
    const z = rider?.getPosition?.()[2] ?? -999;
    if (!this.armed && z > this.armZone[0] && z < this.armZone[1]) this.armed = true;
    if (this.armed) this.age += dt;
    const fallen = this.armed && this.age >= this.collapseAt ? 1 : 0;
    this.progress = approach(this.progress, fallen, 2.4, dt);
    this.place(false);
    if (this.carryRider) {
      const after = this.pose();
      this.carry([after[0] - before[0], after[1] - before[1], after[2] - before[2]], after, rider);
    }
  }

  private carry(delta: Vec3, pose: Vec3, rider: SimEntity | undefined): void {
    const position = rider?.getPosition?.();
    if (!rider?.ride || !position) return;
    const deckTop = pose[1] + this.half[1];
    const onDeck =
      Math.abs(position[0] - pose[0]) < this.half[0] - 0.05 &&
      Math.abs(position[2] - pose[2]) < this.half[2] - 0.05 &&
      position[1] > deckTop + 0.15 &&
      position[1] < deckTop + 1.25;
    if (onDeck) rider.ride(delta, deckTop);
  }

  private pose(): Vec3 {
    return [this.origin[0], this.origin[1] - this.progress * this.drop, this.origin[2]];
  }

  private place(visual: boolean): void {
    writeBody(this.bridge, this.pose(), spawnRotation(), visual, true);
  }
}

/** Deck box plus a slope at each end, so the walk on and off has no vertical riser. */
function spanHull(sx: number, sy: number, sz: number, approach: number, lipTop: number): Float32Array {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const pts: number[] = [];
  const push = (x: number, y: number, z: number) => pts.push(x, y, z);
  for (const x of [-hx, hx]) {
    for (const y of [-hy, hy]) {
      for (const z of [-hz, hz]) push(x, y, z);
    }
  }
  const lipBottom = lipTop - 0.16;
  for (const x of [-hx, hx]) {
    push(x, lipTop, hz + approach);
    push(x, lipBottom, hz + approach);
  }
  return new Float32Array(pts);
}

export function BridgeView({ def }: { def: Extract<EntityDefinition, { type: "breakable-bridge" }> }) {
  const sim = useSimulation();
  const bodyRef = useRef<RapierRigidBody>(null);
  const deck = useRef<Group>(null);
  const [bridge] = useState(createBridge);
  const [sx, sy, sz] = def.size;
  const planks = 5;
  const plankLength = sz / planks - 0.06;
  const approach = def.approach ?? 0;
  const lipTop = -def.position[1];
  const hull = useMemo(
    () => (approach > 0 ? spanHull(sx, sy, sz, approach, lipTop) : null),
    [approach, lipTop, sx, sy, sz],
  );

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    bridge.body = body;
    if (def.carry && body.numColliders() > 0) markShuttle(body.collider(0));
    const entity = new BridgeEntity(
      def.id,
      def.position,
      def.collapseAt,
      def.drop,
      def.armZone,
      [sx / 2, sy / 2, sz / 2],
      def.carry === true,
      bridge,
      () => sim.registry.get("player"),
    );
    sim.registry.register(entity);
    return () => {
      sim.registry.unregister(entity.id);
      bridge.body = null;
    };
  }, [bridge, def.armZone, def.carry, def.collapseAt, def.drop, def.id, def.position, sim, sx, sy, sz]);

  useFrame(() => {
    const group = deck.current;
    const entity = sim.registry.get(def.id);
    if (!group || !entity || entity.kind !== "bridge") return;
    const span = entity as BridgeEntity;
    const warning = span.age > def.collapseAt - 0.55 && span.progress < 0.25;
    group.position.x = warning ? Math.sin(span.age * 46) * 0.035 : 0;
    group.traverse((child) => {
      const material = (child as { material?: MeshStandardMaterial }).material;
      if (!material || !("emissiveIntensity" in material)) return;
      material.emissiveIntensity = span.progress > 0.4 ? 0.05 : warning ? 1.3 : 0.55;
    });
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        colliders={false}
        position={def.position}
        collisionGroups={collisionGroups.world}
      >
        {hull ? (
          <ConvexHullCollider args={[hull]} collisionGroups={collisionGroups.world} />
        ) : (
          <CuboidCollider args={[sx / 2, sy / 2, sz / 2]} collisionGroups={collisionGroups.world} />
        )}
      </RigidBody>
      <FollowBody bodyRef={bodyRef} position={def.position}>
        <group ref={deck}>
          {Array.from({ length: planks }, (_, index) => {
            const z = -sz / 2 + (index + 0.5) * (sz / planks);
            return (
              <mesh key={index} position={[0, 0, z]} castShadow receiveShadow>
                <boxGeometry args={[sx, sy, plankLength]} />
                <meshStandardMaterial color={"#2a3548"} metalness={0.45} roughness={0.4} />
              </mesh>
            );
          })}
          <mesh position={[sx / 2 - 0.05, sy / 2 + 0.01, 0]}>
            <boxGeometry args={[0.05, 0.03, sz * 0.96]} />
            <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[-sx / 2 + 0.05, sy / 2 + 0.01, 0]}>
            <boxGeometry args={[0.05, 0.03, sz * 0.96]} />
            <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.55} />
          </mesh>
          {approach > 0 && (
            <mesh
              position={[0, (sy / 2 + lipTop) / 2, sz / 2 + approach / 2]}
              rotation={[Math.atan2(sy / 2 - lipTop, approach), 0, 0]}
              receiveShadow
            >
              <boxGeometry args={[sx, 0.08, Math.hypot(approach, sy / 2 - lipTop)]} />
              <meshStandardMaterial color={"#2a3548"} metalness={0.45} roughness={0.4} />
            </mesh>
          )}
        </group>
      </FollowBody>
    </>
  );
}
