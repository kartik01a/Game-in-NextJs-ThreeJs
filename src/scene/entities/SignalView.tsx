"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import type { EntityDefinition } from "@/game/levels/types";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";

class SignalEntity implements SimEntity {
  readonly kind = "signal";
  readonly rewindable = true;
  age = 0;

  constructor(
    readonly id: string,
    private readonly position: Vec3,
    private readonly openAt: number,
    private readonly closeAt: number,
  ) {}

  signal(): boolean {
    return this.age >= this.openAt && this.age < this.closeAt;
  }

  getPosition(): Vec3 {
    return this.position;
  }

  captureState(): EntityState {
    return makeEntityState(this.position, { age: this.age });
  }

  restoreState(state: EntityState): void {
    this.age = typeof state.custom.age === "number" ? state.custom.age : 0;
  }

  reset(): void {
    this.age = 0;
  }

  setActive(): void {}

  prePhysics(dt: number): void {
    this.age += dt;
  }
}

export function SignalView({ def }: { def: Extract<EntityDefinition, { type: "timed-signal" }> }) {
  const sim = useSimulation();
  const lamp = useRef<MeshStandardMaterial>(null);

  useEffect(() => {
    const entity = new SignalEntity(def.id, def.position, def.openAt, def.closeAt);
    sim.registry.register(entity);
    return () => sim.registry.unregister(entity.id);
  }, [def.closeAt, def.id, def.openAt, def.position, sim]);

  useFrame(() => {
    const material = lamp.current;
    const entity = sim.registry.get(def.id);
    if (!material || !entity || entity.kind !== "signal") return;
    const open = entity.signal?.() === true;
    material.color.set(open ? theme.cyan : theme.amber);
    material.emissive.set(open ? theme.cyan : theme.amber);
    material.emissiveIntensity = open ? 2.2 : 0.35;
  });

  const [x, y, z] = def.position;
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[0.16, 0.7, 0.16]} />
        <meshStandardMaterial color={"#242b38"} metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial ref={lamp} color={theme.amber} emissive={theme.amber} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}
