"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useRapier, type RapierRigidBody } from "@react-three/rapier";
import type { Mesh } from "three";
import { theme } from "@/game/core/GameConfig";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import type { EntityDefinition } from "@/game/levels/types";
import { makeEntityState, type EntityState, type Vec3 } from "@/game/time/types";
import { useSimulation } from "@/scene/SimulationContext";
import { collisionGroups } from "@/scene/runtime/physicsGroups";
import type { World } from "@dimforge/rapier3d-compat";

class PlateEntity implements SimEntity {
  readonly kind = "plate";
  readonly rewindable = true;
  pressed = false;

  constructor(
    readonly id: string,
    private readonly position: Vec3,
    private readonly bridge: { body: RapierRigidBody | null },
    private readonly getWorld: () => World,
    private readonly play: (id: "plate") => void,
  ) {}

  signal(): boolean {
    return this.pressed;
  }

  getPosition(): Vec3 {
    return this.position;
  }

  captureState(): EntityState {
    return makeEntityState(this.position, { pressed: this.pressed });
  }

  restoreState(state: EntityState): void {
    this.pressed = state.custom.pressed === true;
  }

  reset(): void {
    this.pressed = false;
  }

  setActive(): void {}

  postPhysics(): void {
    const body = this.bridge.body;
    if (!body || body.numColliders() < 1) return;
    let overlaps = 0;
    this.getWorld().intersectionPairsWith(body.collider(0), () => {
      overlaps += 1;
    });
    const pressed = overlaps > 0;
    if (pressed !== this.pressed) this.play("plate");
    this.pressed = pressed;
  }
}

export function PlateView({ def }: { def: Extract<EntityDefinition, { type: "pressure-plate" }> }) {
  const sim = useSimulation();
  const { world } = useRapier();
  const bodyRef = useRef<RapierRigidBody>(null);
  const pad = useRef<Mesh>(null);
  const [x, y, z] = def.position;

  useEffect(() => {
    const bridge = { body: bodyRef.current };
    const entity = new PlateEntity(def.id, def.position, bridge, () => world, (id) => sim.audio.play(id));
    sim.registry.register(entity);
    return () => sim.registry.unregister(entity.id);
  }, [def.id, def.position, sim, world]);

  useFrame(() => {
    const mesh = pad.current;
    const entity = sim.registry.get(def.id);
    if (!mesh || !entity || entity.kind !== "plate") return;
    const pressed = (entity as PlateEntity).pressed;
    mesh.position.y = pressed ? 0.02 : 0.045;
    const material = mesh.material;
    if (!Array.isArray(material) && "emissiveIntensity" in material) {
      material.emissiveIntensity = pressed ? 1.5 : 0.25;
    }
  });

  return (
    <group position={[x, y, z]}>
      <RigidBody ref={bodyRef} type="fixed" colliders={false} position={[0, 0.5, 0]}>
        <CuboidCollider args={[0.62, 0.4, 0.62]} sensor collisionGroups={collisionGroups.sensor} />
      </RigidBody>
      <mesh ref={pad} position={[0, 0.045, 0]} receiveShadow>
        <boxGeometry args={[def.size[0], 0.06, def.size[1]]} />
        <meshStandardMaterial
          color={"#1a2433"}
          emissive={theme.cyan}
          emissiveIntensity={0.25}
          roughness={0.45}
          metalness={0.35}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[0.55, 0.68, 24]} />
        <meshStandardMaterial color={theme.cyan} emissive={theme.cyan} emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
}
