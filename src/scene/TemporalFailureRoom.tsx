"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { CanvasTexture, SRGBColorSpace, type DirectionalLight, type Mesh, type PointLight } from "three";
import { theme } from "@/game/core/GameConfig";
import { fault07 } from "@/game/levels/definitions/level-07";
import { useSimulation } from "@/scene/SimulationContext";
import { useSettingsStore } from "@/store/settingsStore";
import { collisionGroups } from "@/scene/runtime/physicsGroups";

const back = -22.4;
const front = 9.7;
const side = 5.6;
const wallT = 0.4;
const wallH = 3.6;

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
  context.strokeStyle = "#ff4d6a";
  context.lineWidth = 4;
  context.strokeRect(12, 12, 488, 232);
  context.fillStyle = "#ff4d6a";
  context.font = "600 26px ui-monospace, monospace";
  context.fillText("CHAMBER 07", 36, 78);
  context.fillStyle = "#e8eef6";
  context.font = "600 34px ui-monospace, monospace";
  context.fillText("TEMPORAL FAILURE", 36, 132);
  context.fillStyle = "#8ea0b4";
  context.font = "400 22px ui-monospace, monospace";
  context.fillText("ORDER THE BREAK", 36, 188);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function GhostBlock({ position, phase }: { position: [number, number, number]; phase: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = Math.sin(clock.elapsedTime * 1.6 + phase) > 0.25;
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.42, 0.42, 0.42]} />
      <meshStandardMaterial
        color={theme.temporal}
        emissive={theme.temporal}
        emissiveIntensity={0.9}
        transparent
        opacity={0.45}
      />
    </mesh>
  );
}

function Mote({ index }: { index: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime * 0.7 + index * 1.3;
    mesh.position.set(Math.sin(t * 0.45) * 2.4, 0.8 + ((index * 0.37) % 2.2), -8 + (index % 6) * 2.2 + Math.cos(t) * 0.35);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={theme.temporal} transparent opacity={0.8} />
    </mesh>
  );
}

function Instability() {
  const sim = useSimulation();
  const doorLight = useRef<PointLight>(null);
  const buzz = useRef(0);

  useFrame((_, dt) => {
    const light = doorLight.current;
    if (light) {
      const drop = Math.sin(light.position.x + performance.now() * 0.017) > 0.86;
      light.intensity = drop ? 4 : 30;
    }
    buzz.current += dt;
    if (buzz.current < 3.2) return;
    buzz.current = 0;
    if (sim.gameState === "PLAYING" && sim.time.mode !== "REWINDING") sim.audio.play("instability");
  });

  return (
    <>
      <pointLight ref={doorLight} position={[0, 2.5, fault07.doorZ]} color={theme.cyan} intensity={30} distance={12} />
      <GhostBlock position={[1.4, 1.3, 2.4]} phase={0.4} />
      <GhostBlock position={[-1.6, 1.8, 3.6]} phase={2.1} />
      <GhostBlock position={[0.4, 2.4, -12]} phase={4.2} />
      {Array.from({ length: 8 }, (_, index) => (
        <Mote key={index} index={index} />
      ))}
    </>
  );
}

export function TemporalFailureRoom() {
  const sign = useMemo(() => createSign(), []);
  const light = useRef<DirectionalLight>(null);
  const south = span(back, fault07.lipSouth);
  const north = span(fault07.lipNorth, front);
  const depth = span(back, front);
  const divider = span(fault07.wallSouth, fault07.wallNorth);

  useFrame(() => {
    if (light.current) light.current.castShadow = useSettingsStore.getState().shadows;
  });

  return (
    <group>
      <hemisphereLight args={["#d5e4f2", "#3a2428", 0.72]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        ref={light}
        position={[4, 10, -2]}
        intensity={6.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <pointLight position={[-3.6, 2.3, -12]} color={theme.amber} intensity={22} distance={14} />
      <pointLight position={[0, 2.1, fault07.beamZ]} color={theme.danger} intensity={10} distance={7} />
      <Instability />

      <Slab position={[0, -0.2, south.center]} size={[side * 2, 0.4, south.size]} />
      <Slab position={[0, -0.2, north.center]} size={[side * 2, 0.4, north.size]} />
      <Slab
        position={[0, -3.4, (fault07.lipSouth + fault07.lipNorth) / 2]}
        size={[side * 2, 0.3, fault07.lipNorth - fault07.lipSouth]}
        color={"#10151c"}
      />

      <Wall position={[0, wallH / 2, back - wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[0, wallH / 2, front + wallT / 2]} size={[side * 2 + wallT, wallH, wallT]} />
      <Wall position={[-(side + wallT / 2), wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[side + wallT / 2, wallH / 2, depth.center]} size={[wallT, wallH, depth.size + wallT]} />
      <Wall position={[fault07.wallX, wallH / 2, divider.center]} size={[0.32, wallH, divider.size]} />
      <Wall position={[-3.35, wallH / 2, fault07.doorZ]} size={[4.3, wallH, 0.32]} />
      <Wall position={[3.35, wallH / 2, fault07.doorZ]} size={[4.3, wallH, 0.32]} />
      <Wall position={[0, 3.15, fault07.doorZ]} size={[2.4, 0.9, 0.32]} />

      <mesh position={[0, 3.55, depth.center]} userData={{ occludeCamera: true }}>
        <boxGeometry args={[side * 2 + wallT, 0.08, depth.size + wallT]} />
        <meshStandardMaterial color={"#0c1016"} roughness={1} />
      </mesh>
      <mesh position={[-2.7, 0.03, fault07.wallNorth + 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.68, 28]} />
        <meshStandardMaterial color={theme.amber} emissive={theme.amber} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[5.25, 1.7, -8.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 0.95]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
