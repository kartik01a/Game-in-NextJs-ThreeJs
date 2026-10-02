"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Group } from "three";

/**
 * Copies a rigid-body pose onto a visual group every frame.
 * Rewind updates the body directly, and this keeps the mesh in step
 * even when the physics world is not integrating.
 */
export function FollowBody({
  bodyRef,
  position,
  children,
}: {
  bodyRef: RefObject<RapierRigidBody | null>;
  position?: [number, number, number];
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);

  useFrame(() => {
    const body = bodyRef.current;
    const group = ref.current;
    if (!body || !group) return;
    const translation = body.translation();
    const rotation = body.rotation();
    group.position.set(translation.x, translation.y, translation.z);
    group.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  });

  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}
