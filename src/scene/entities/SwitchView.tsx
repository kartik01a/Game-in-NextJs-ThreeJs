"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { Group, MeshStandardMaterial } from "three";
import { theme } from "@/game/core/GameConfig";
import type { EntityDefinition } from "@/game/levels/types";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

class SwitchEntity implements SimEntity {
  readonly kind = "switch";
  readonly rewindable = true;
  activated = false;

  constructor(
    readonly id: string,
    private readonly position: Vec3,
    private readonly play: (id: "switch") => void,
  ) {}

  signal(): boolean {
    return this.activated;
  }

  interactPrompt(): string {
    return this.activated ? "CUT POWER" : "ARM GATE";
  }

  interact(): void {
    this.activated = !this.activated;
    this.play("switch");
  }

  getInteractPosition(): Vec3 {
    return [this.position[0], 1.05, this.position[2]];
  }

  getPosition(): Vec3 {
    return this.getInteractPosition();
  }

  captureState(): EntityState {
    return makeEntityState(this.position, { activated: this.activated });
  }

  restoreState(state: EntityState): void {
    this.activated = state.custom.activated === true;
  }

  reset(): void {
    this.activated = false;
  }

  setActive(): void {}
}

export function SwitchView({ def }: { def: Extract<EntityDefinition, { type: "switch" }> }) {
  const sim = useSimulation();
  const bodyRef = useRef<RapierRigidBody>(null);
  const lever = useRef<Group>(null);

  useEffect(() => {
    const entity = new SwitchEntity(def.id, def.position, (id) => sim.audio.play(id));
    sim.registry.register(entity);
    return () => sim.registry.unregister(entity.id);
  }, [def.id, def.position, sim]);

  useFrame((_, dt) => {
    const entity = sim.registry.get(def.id);
    const group = lever.current;
    if (!group || !entity || entity.kind !== "switch") return;
    const target = (entity as SwitchEntity).activated ? -0.9 : 0.55;
    group.rotation.x += (target - group.rotation.x) * Math.min(1, dt * 12);
  });

  const [x, , z] = def.position;
  return (
    <group position={[x, 0, z]}>
      <RigidBody ref={bodyRef} type="fixed" colliders={false} position={[0, 0.45, 0]}>
        <CuboidCollider args={[0.28, 0.45, 0.28]} collisionGroups={collisionGroups.world} />
      </RigidBody>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.34, 0.56, 8]} />
        <meshStandardMaterial color={"#242b38"} metalness={0.45} roughness={0.4} />
      </mesh>
      <group ref={lever} position={[0, 0.72, 0]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.46, 0.08]} />
          <meshStandardMaterial color={theme.metal} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.7} />
        </mesh>
      </group>
      <SwitchLamp id={def.id} />
    </group>
  );
}

function SwitchLamp({ id }: { id: string }) {
  const sim = useSimulation();
  const lamp = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    const material = lamp.current;
    const entity = sim.registry.get(id);
    if (!material || !entity || entity.kind !== "switch") return;
    const on = (entity as SwitchEntity).activated;
    material.emissive.set(on ? theme.cyan : theme.amber);
    material.color.set(on ? theme.cyan : theme.amber);
    material.emissiveIntensity = on ? 1.6 : 0.35;
  });
  return (
    <mesh position={[0, 1.05, 0]}>
      <boxGeometry args={[0.16, 0.08, 0.08]} />
      <meshStandardMaterial ref={lamp} color={theme.amber} emissive={theme.amber} emissiveIntensity={0.35} />
    </mesh>
  );
}
