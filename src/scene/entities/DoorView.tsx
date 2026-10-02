"use client";

/* Physics bridges are mutable engine cells. They are not React state. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, useState } from "react";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { theme } from "@/game/core/GameConfig";
import type { DoorControl } from "@/game/entities/RewindableEntity";
import type { EntityDefinition } from "@/game/levels/types";
import { approach, doorPanelSpread } from "@/game/levels/logic";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { FollowBody } from "@/scene/runtime/FollowBody";
import { createBridge, type BodyBridge } from "@/scene/runtime/body";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

const CLOSED_SPREAD = 0.48;
const OPEN_SPREAD = 1.42;
const PANEL_Y = 1.25;
const DOOR_SPEED = 1.35;

class DoorEntity implements DoorControl {
  readonly kind = "door";
  readonly rewindable = true;
  progress = 0;
  target = 0;

  constructor(
    readonly id: string,
    readonly linkedTo: readonly string[],
    private readonly origin: Vec3,
    private readonly left: BodyBridge,
    private readonly right: BodyBridge,
    private readonly play: (id: "door") => void,
  ) {}

  setOpenTarget(open: boolean): void {
    const next = open ? 1 : 0;
    if (next !== this.target && Math.abs(this.progress - next) > 0.08) this.play("door");
    this.target = next;
  }

  captureState(): EntityState {
    return makeEntityState(this.origin, { progress: this.progress, target: this.target });
  }

  restoreState(state: EntityState, visual: boolean): void {
    this.progress = typeof state.custom.progress === "number" ? state.custom.progress : 0;
    this.target = typeof state.custom.target === "number" ? state.custom.target : 0;
    this.place(visual);
  }

  reset(): void {
    this.progress = 0;
    this.target = 0;
    this.place(true);
  }

  setActive(active: boolean): void {
    for (const bridge of [this.left, this.right]) {
      if (bridge.object) bridge.object.visible = active;
    }
  }

  getPosition(): Vec3 {
    return [this.origin[0], PANEL_Y, this.origin[2]];
  }

  prePhysics(dt: number): void {
    this.progress = approach(this.progress, this.target, DOOR_SPEED, dt);
    this.place(false);
  }

  private place(visual: boolean): void {
    const spread = doorPanelSpread(this.progress, CLOSED_SPREAD, OPEN_SPREAD);
    this.write(this.left, this.origin[0] - spread, visual);
    this.write(this.right, this.origin[0] + spread, visual);
  }

  private write(bridge: BodyBridge, x: number, visual: boolean): void {
    const body = bridge.body;
    if (!body) return;
    const translation = { x, y: PANEL_Y, z: this.origin[2] };
    if (visual) {
      body.setTranslation(translation, true);
      if (bridge.object) {
        bridge.object.position.set(translation.x, translation.y, translation.z);
      }
    }
    body.setNextKinematicTranslation(translation);
  }
}

function Panel({
  bridge,
  position,
}: {
  bridge: BodyBridge;
  position: [number, number, number];
}) {
  const bodyRef = useRef<RapierRigidBody>(null);
  useEffect(() => {
    bridge.body = bodyRef.current;
    return () => {
      bridge.body = null;
    };
  }, [bridge]);

  return (
    <>
      <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position} lockRotations>
        <CuboidCollider args={[0.46, 1.2, 0.1]} collisionGroups={collisionGroups.world} />
      </RigidBody>
      <FollowBody bodyRef={bodyRef} position={position}>
        <mesh castShadow receiveShadow userData={{ occludeCamera: true }}>
          <boxGeometry args={[0.92, 2.4, 0.16]} />
          <meshStandardMaterial color={"#2c3546"} metalness={0.55} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <boxGeometry args={[0.7, 0.08, 0.02]} />
          <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.55} />
        </mesh>
      </FollowBody>
    </>
  );
}

export function DoorView({ def }: { def: Extract<EntityDefinition, { type: "door" }> }) {
  const sim = useSimulation();
  const [left] = useState(createBridge);
  const [right] = useState(createBridge);
  const [x, , z] = def.position;

  useEffect(() => {
    const entity = new DoorEntity(def.id, def.linkedTo, def.position, left, right, (id) => sim.audio.play(id));
    sim.registry.register(entity);
    return () => sim.registry.unregister(entity.id);
  }, [def.id, def.linkedTo, def.position, left, right, sim]);

  return (
    <group>
      <Panel bridge={left} position={[x - CLOSED_SPREAD, PANEL_Y, z]} />
      <Panel bridge={right} position={[x + CLOSED_SPREAD, PANEL_Y, z]} />
      <mesh position={[x, 2.72, z]}>
        <boxGeometry args={[2.3, 0.16, 0.28]} />
        <meshStandardMaterial color={"#1c2430"} metalness={0.4} roughness={0.45} />
      </mesh>
    </group>
  );
}
