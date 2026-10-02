"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { FollowBody } from "@/scene/runtime/FollowBody";
import { createBridge, readBody, spawnRotation, writeBody, zeroVelocity, type BodyBridge } from "@/scene/runtime/body";
import { collisionGroups } from "@/scene/runtime/physicsGroups";
import type { EntityDefinition } from "@/game/levels/types";

class BoxEntity implements SimEntity {
  readonly kind = "box";
  readonly rewindable = true;

  constructor(
    readonly id: string,
    private readonly spawn: Vec3,
    private readonly bridge: BodyBridge,
  ) {}

  captureState(): EntityState {
    if (!this.bridge.body) return makeEntityState(this.spawn);
    const pose = readBody(this.bridge.body);
    return makeEntityState(pose.position, {}, pose.rotation, pose.linear, pose.angular);
  }

  restoreState(state: EntityState, visual: boolean): void {
    writeBody(this.bridge, state.position, state.rotation, visual, false);
    if (this.bridge.body) zeroVelocity(this.bridge.body);
  }

  reset(): void {
    writeBody(this.bridge, this.spawn, spawnRotation(), true, false);
    if (this.bridge.body) zeroVelocity(this.bridge.body);
  }

  setActive(active: boolean): void {
    if (this.bridge.object) this.bridge.object.visible = active;
    const body = this.bridge.body;
    if (!body) return;
    const count = body.numColliders();
    for (let index = 0; index < count; index += 1) body.collider(index).setEnabled(active);
  }

  getPosition(): Vec3 {
    return this.bridge.body ? readBody(this.bridge.body).position : this.spawn;
  }

  onRewindStart(): void {
    if (this.bridge.body) zeroVelocity(this.bridge.body);
  }

  onRewindEnd(state: EntityState | undefined): void {
    const body = this.bridge.body;
    if (!body || !state) return;
    const linear = state.linearVelocity;
    const angular = state.angularVelocity;
    body.setLinvel({ x: linear[0], y: linear[1], z: linear[2] }, true);
    body.setAngvel({ x: angular[0], y: angular[1], z: angular[2] }, true);
    body.wakeUp();
  }
}

export function BoxView({ def }: { def: Extract<EntityDefinition, { type: "pushable-box" }> }) {
  const sim = useSimulation();
  const bodyRef = useRef<RapierRigidBody>(null);
  const [bridge] = useState(createBridge);
  const half = def.size / 2;
  const key = def.appearance === "key";

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    bridge.body = body;
    const entity = new BoxEntity(def.id, def.position, bridge);
    sim.registry.register(entity);
    return () => {
      sim.registry.unregister(entity.id);
      bridge.body = null;
    };
  }, [bridge, def.id, def.position, sim]);

  return (
    <>
    <RigidBody
      ref={bodyRef}
      position={def.position}
      colliders={false}
      mass={key ? 1.4 : 6}
      friction={key ? 0.45 : 0.92}
      restitution={key ? 0.12 : 0.02}
      linearDamping={key ? 0.35 : 1.35}
      angularDamping={2}
      ccd
      canSleep={false}
      enabledRotations={[false, false, false]}
      collisionGroups={collisionGroups.dynamic}
    >
      <CuboidCollider
        args={[half, half, half]}
        collisionGroups={collisionGroups.dynamic}
        friction={key ? 0.4 : 0.92}
      />
    </RigidBody>
    <FollowBody bodyRef={bodyRef} position={def.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[def.size, def.size, def.size]} />
        <meshStandardMaterial
          color={key ? theme.amber : theme.crate}
          emissive={key ? theme.amber : "#000000"}
          emissiveIntensity={key ? 0.45 : 0}
          roughness={key ? 0.35 : 0.62}
          metalness={key ? 0.55 : 0.28}
        />
      </mesh>
      <mesh position={[0, 0, half + 0.001]}>
        <planeGeometry args={[def.size * 0.72, 0.06]} />
        <meshStandardMaterial
          color={key ? theme.ink : theme.cyan}
          emissive={key ? theme.amber : theme.cyan}
          emissiveIntensity={0.8}
        />
      </mesh>
    </FollowBody>
    </>
  );
}
