"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import { shutterY } from "@/game/levels/motion";
import type { EntityDefinition } from "@/game/levels/types";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { FollowBody } from "@/scene/runtime/FollowBody";
import { createBridge, spawnRotation, writeBody, type BodyBridge } from "@/scene/runtime/body";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

class ShutterEntity implements SimEntity {
  readonly kind = "shutter";
  readonly rewindable = true;
  age = 0;

  constructor(
    readonly id: string,
    private readonly origin: Vec3,
    private readonly raised: number,
    private readonly lowered: number,
    private readonly releaseAt: number,
    private readonly speed: number,
    private readonly bridge: BodyBridge,
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
    this.age += dt;
    this.place(false);
  }

  private pose(): Vec3 {
    const y = shutterY(this.age, this.releaseAt, this.raised, this.lowered, this.speed);
    return [this.origin[0], y, this.origin[2]];
  }

  private place(visual: boolean): void {
    writeBody(this.bridge, this.pose(), spawnRotation(), visual, true);
  }
}

export function ShutterView({ def }: { def: Extract<EntityDefinition, { type: "timed-shutter" }> }) {
  const sim = useSimulation();
  const bodyRef = useRef<RapierRigidBody>(null);
  const [bridge] = useState(createBridge);
  const [sx, sy, sz] = def.size;
  const start: Vec3 = [def.position[0], def.raised, def.position[2]];

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    bridge.body = body;
    const entity = new ShutterEntity(def.id, def.position, def.raised, def.lowered, def.releaseAt, def.speed, bridge);
    sim.registry.register(entity);
    return () => {
      sim.registry.unregister(entity.id);
      bridge.body = null;
    };
  }, [bridge, def.id, def.lowered, def.position, def.raised, def.releaseAt, def.speed, sim]);

  return (
    <>
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        colliders={false}
        position={start}
        collisionGroups={collisionGroups.world}
      >
        <CuboidCollider args={[sx / 2, sy / 2, sz / 2]} collisionGroups={collisionGroups.world} />
      </RigidBody>
      <FollowBody bodyRef={bodyRef} position={start}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={def.size} />
          <meshStandardMaterial color={"#2a3344"} metalness={0.55} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0, sz / 2 + 0.01]}>
          <boxGeometry args={[sx * 0.72, 0.08, 0.02]} />
          <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.7} />
        </mesh>
      </FollowBody>
    </>
  );
}
