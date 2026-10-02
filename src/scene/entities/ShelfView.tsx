"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import type { EntityDefinition } from "@/game/levels/types";
import { approach } from "@/game/levels/logic";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { FollowBody } from "@/scene/runtime/FollowBody";
import { createBridge, spawnRotation, writeBody, type BodyBridge } from "@/scene/runtime/body";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

class ShelfEntity implements SimEntity {
  readonly kind = "shelf";
  readonly rewindable = true;
  age = 0;
  progress = 0;

  constructor(
    readonly id: string,
    private readonly origin: Vec3,
    private readonly releaseAt: number,
    private readonly slide: number,
    private readonly bridge: BodyBridge,
  ) {}

  captureState(): EntityState {
    return makeEntityState(this.pose(), { age: this.age, progress: this.progress });
  }

  restoreState(state: EntityState, visual: boolean): void {
    this.age = typeof state.custom.age === "number" ? state.custom.age : 0;
    this.progress = typeof state.custom.progress === "number" ? state.custom.progress : 0;
    this.place(visual);
  }

  reset(): void {
    this.age = 0;
    this.progress = 0;
    this.place(true);
  }

  setActive(active: boolean): void {
    if (this.bridge.object) this.bridge.object.visible = active;
  }

  prePhysics(dt: number): void {
    this.age += dt;
    const open = this.age >= this.releaseAt ? 1 : 0;
    this.progress = approach(this.progress, open, 3.4, dt);
    this.place(false);
  }

  private pose(): Vec3 {
    return [this.origin[0] + this.progress * this.slide, this.origin[1], this.origin[2]];
  }

  private place(visual: boolean): void {
    writeBody(this.bridge, this.pose(), spawnRotation(), visual, true);
  }
}

export function ShelfView({ def }: { def: Extract<EntityDefinition, { type: "drop-shelf" }> }) {
  const sim = useSimulation();
  const bodyRef = useRef<RapierRigidBody>(null);
  const [bridge] = useState(createBridge);
  const [sx, sy, sz] = def.size;

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    bridge.body = body;
    const entity = new ShelfEntity(def.id, def.position, def.releaseAt, def.slide, bridge);
    sim.registry.register(entity);
    return () => {
      sim.registry.unregister(entity.id);
      bridge.body = null;
    };
  }, [bridge, def.id, def.position, def.releaseAt, def.slide, sim]);

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
        <mesh castShadow receiveShadow>
          <boxGeometry args={def.size} />
          <meshStandardMaterial color={"#2c3548"} metalness={0.6} roughness={0.32} />
        </mesh>
        <mesh position={[0, sy / 2 + 0.01, 0]}>
          <boxGeometry args={[sx * 0.92, 0.02, sz * 0.92]} />
          <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.7} />
        </mesh>
      </FollowBody>
    </>
  );
}
