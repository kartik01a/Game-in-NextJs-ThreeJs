"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { Group, MeshStandardMaterial } from "three";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
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
    private readonly bridge: BodyBridge,
    private readonly playerZ: () => number,
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
    const z = this.playerZ();
    if (!this.armed && z > this.armZone[0] && z < this.armZone[1]) this.armed = true;
    if (this.armed) this.age += dt;
    const fallen = this.armed && this.age >= this.collapseAt ? 1 : 0;
    this.progress = approach(this.progress, fallen, 2.4, dt);
    this.place(false);
  }

  private pose(): Vec3 {
    return [this.origin[0], this.origin[1] - this.progress * this.drop, this.origin[2]];
  }

  private place(visual: boolean): void {
    writeBody(this.bridge, this.pose(), spawnRotation(), visual, true);
  }
}

export function BridgeView({ def }: { def: Extract<EntityDefinition, { type: "breakable-bridge" }> }) {
  const sim = useSimulation();
  const bodyRef = useRef<RapierRigidBody>(null);
  const deck = useRef<Group>(null);
  const [bridge] = useState(createBridge);
  const [sx, sy, sz] = def.size;
  const planks = 5;
  const plankLength = sz / planks - 0.06;

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    bridge.body = body;
    const entity = new BridgeEntity(
      def.id,
      def.position,
      def.collapseAt,
      def.drop,
      def.armZone,
      bridge,
      () => {
        const player = sim.registry.get("player");
        return player?.getPosition?.()[2] ?? -999;
      },
    );
    sim.registry.register(entity);
    return () => {
      sim.registry.unregister(entity.id);
      bridge.body = null;
    };
  }, [bridge, def.armZone, def.collapseAt, def.drop, def.id, def.position, sim]);

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
        <CuboidCollider args={[sx / 2, sy / 2, sz / 2]} collisionGroups={collisionGroups.world} />
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
        </group>
      </FollowBody>
    </>
  );
}
