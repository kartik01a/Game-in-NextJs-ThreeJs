"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import {
  CanvasTexture,
  SRGBColorSpace,
  type DirectionalLight,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type PointLight,
} from "three";
import { theme } from "@/game/core/GameConfig";
import { core08 } from "@/game/levels/definitions/level-08";
import { useSimulation } from "@/scene/SimulationContext";
import { useSettingsStore } from "@/store/settingsStore";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

const back = -20.2;
const front = 12.4;
const side = 8.4;
const wallT = 0.4;
const wallH = 4;
const hallSouth = -7.55;
const tongueWest = -8.3;
const tongueEast = -3.2;

function Wall({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} collisionGroups={collisionGroups.world} />
      <mesh castShadow receiveShadow userData={{ occludeCamera: true }}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={theme.wall} roughness={0.86} metalness={0.16} />
      </mesh>
    </RigidBody>
  );
}

function Slab({
  position,
  size,
  color = theme.floor,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} collisionGroups={collisionGroups.world} />
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.12} />
      </mesh>
    </RigidBody>
  );
}

function span(start: number, end: number): { center: number; size: number } {
  return { center: (start + end) / 2, size: end - start };
}

function createSign(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);
  context.fillStyle = "#10151d";
  context.fillRect(0, 0, 512, 256);
  context.strokeStyle = "#3ce0ff";
  context.lineWidth = 4;
  context.strokeRect(12, 12, 488, 232);
  context.fillStyle = "#3ce0ff";
  context.font = "600 26px ui-monospace, monospace";
  context.fillText("CHAMBER 08", 36, 78);
  context.fillStyle = "#e8eef6";
  context.font = "600 32px ui-monospace, monospace";
  context.fillText("MERIDIAN CORE", 36, 132);
  context.fillStyle = "#8ea0b4";
  context.font = "400 22px ui-monospace, monospace";
  context.fillText("STABILIZE", 36, 188);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function Core() {
  const sim = useSimulation();
  const rings = useRef<Group>(null);
  const glow = useRef<MeshStandardMaterial>(null);
  const spin = useRef(1.5);

  useFrame((_, dt) => {
    const calm = sim.stabilizing || sim.gameState === "LEVEL_COMPLETE";
    const target = calm ? 0.04 : 1.45;
    spin.current += (target - spin.current) * Math.min(1, dt * 1.5);
    const group = rings.current;
    if (group) {
      group.rotation.y += dt * spin.current;
      group.rotation.x = calm ? 0.15 : 0.55 + Math.sin(group.rotation.y) * 0.08;
    }
    const material = glow.current;
    if (material) {
      material.color.set(calm ? theme.cyan : theme.temporal);
      material.emissive.set(calm ? theme.cyan : theme.danger);
      material.emissiveIntensity = calm ? 1.4 : 1.8;
    }
  });

  return (
    <group position={[0, 1.7, 11.35]}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 1.5, 12]} />
        <meshStandardMaterial color={"#1a2230"} metalness={0.6} roughness={0.3} />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.045, 8, 28]} />
          <meshStandardMaterial ref={glow} color={theme.temporal} emissive={theme.danger} emissiveIntensity={1.8} />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
          <torusGeometry args={[0.72, 0.03, 8, 24]} />
          <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function Settling() {
  const sim = useSimulation();
  const fault = useRef<PointLight>(null);
  const mote = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const calm = sim.stabilizing || sim.gameState === "LEVEL_COMPLETE";
    const light = fault.current;
    if (light) {
      const drop = !calm && Math.sin(clock.elapsedTime * 11) > 0.82;
      light.intensity = calm ? 18 : drop ? 3 : 26;
      light.color.set(calm ? theme.cyan : theme.danger);
    }
    const shard = mote.current;
    if (shard) shard.visible = !calm && Math.sin(clock.elapsedTime * 1.8) > 0.15;
  });

  return (
    <>
      <pointLight ref={fault} position={[0, 2.6, core08.doorZ]} color={theme.danger} intensity={26} distance={14} />
      <mesh ref={mote} position={[1.8, 1.6, 3.2]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={theme.temporal} emissive={theme.temporal} emissiveIntensity={0.8} transparent opacity={0.4} />
      </mesh>
      <mesh position={[-1.5, 2.1, 4.4]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={theme.temporal} transparent opacity={0.75} />
      </mesh>
    </>
  );
}

export function MeridianRoom() {
  const sign = useMemo(() => createSign(), []);
  const light = useRef<DirectionalLight>(null);
  const hall = span(-3.65, core08.lipSouth);
  const north = span(core08.lipNorth, front);
  const conduit = span(back, -19.05);
  const depth = span(back, front);
  const westX = (tongueWest + tongueEast) / 2;
  const westW = tongueEast - tongueWest;

  useFrame(() => {
    if (light.current) light.current.castShadow = useSettingsStore.getState().shadows;
  });

  return (
    <group>
      <hemisphereLight args={["#d5e4f2", "#2a2030", 0.78]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        ref={light}
        position={[6, 12, -3]}
        intensity={6.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={48}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <pointLight position={[core08.bridgeX, 2.4, core08.bridgeZ]} color={theme.amber} intensity={20} distance={12} />
      <pointLight position={[0, 3.2, 11.2]} color={theme.cyan} intensity={36} distance={16} />
      <Settling />
      <Core />

      <Slab position={[0, -0.2, hall.center]} size={[side * 2, 0.4, hall.size]} />
      <Slab position={[westX, -0.2, conduit.center]} size={[westW, 0.4, conduit.size]} />
      <Slab position={[0, -0.2, north.center]} size={[side * 2, 0.4, north.size]} />
      <Slab
        position={[westX, -3.4, (-19.05 + -4.3) / 2]}
        size={[westW, 0.3, -4.3 - -19.05]}
        color={"#10151c"}
      />
      <Slab
        position={[0, -3.4, (core08.lipSouth + core08.lipNorth) / 2]}
        size={[side * 2, 0.3, core08.lipNorth - core08.lipSouth]}
        color={"#10151c"}
      />

      <Wall position={[0, wallH / 2, back - wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[0, wallH / 2, front + wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[-(side + wallT / 2), wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[side + wallT / 2, wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[-4.8, wallH / 2, core08.doorZ]} size={[7.2, wallH, 0.32]} />
      <Wall position={[4.8, wallH / 2, core08.doorZ]} size={[7.2, wallH, 0.32]} />
      <Wall position={[0, 3.2, core08.doorZ]} size={[2.5, 1.1, 0.32]} />

      <mesh position={[0, 3.9, depth.center]} userData={{ occludeCamera: true }}>
        <boxGeometry args={[side * 2 + wallT, 0.08, depth.size + wallT]} />
        <meshStandardMaterial color={"#0c1016"} roughness={1} />
      </mesh>
      <mesh position={[0, 0.04, -3.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.46, 0.72, 28]} />
        <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.95} />
      </mesh>
      <mesh position={[0, 0.03, 11.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 1.05, 32]} />
        <meshStandardMaterial color={theme.cyan} emissive={theme.cyan} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[7.9, 1.8, -4.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 0.95]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
