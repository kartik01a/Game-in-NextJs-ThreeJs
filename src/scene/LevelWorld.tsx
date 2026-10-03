"use client";

import type { EntityDefinition } from "@/game/levels/types";
import { useSimulation } from "@/scene/SimulationContext";
import { BoxView } from "@/scene/entities/BoxView";
import { BridgeView } from "@/scene/entities/BridgeView";
import { DoorView } from "@/scene/entities/DoorView";
import { LaserView } from "@/scene/entities/LaserView";
import { ShuttleView } from "@/scene/entities/ShuttleView";
import { PlateView } from "@/scene/entities/PlateView";
import { PlayerView } from "@/scene/entities/PlayerView";
import { ShelfView } from "@/scene/entities/ShelfView";
import { SignalView } from "@/scene/entities/SignalView";
import { ShutterView } from "@/scene/entities/ShutterView";
import { SwitchView } from "@/scene/entities/SwitchView";
import { AccelerateRoom } from "@/scene/AccelerateRoom";
import { BrokenBridgeRoom } from "@/scene/BrokenBridgeRoom";
import { FrozenMomentRoom } from "@/scene/FrozenMomentRoom";
import { TwoTimelinesRoom } from "@/scene/TwoTimelinesRoom";
import { FallingKeyRoom } from "@/scene/FallingKeyRoom";
import { Laboratory } from "@/scene/Laboratory";

function EntityView({ entity }: { entity: EntityDefinition }) {
  switch (entity.type) {
    case "pushable-box":
      return <BoxView def={entity} />;
    case "switch":
      return <SwitchView def={entity} />;
    case "pressure-plate":
      return <PlateView def={entity} />;
    case "door":
      return <DoorView def={entity} />;
    case "drop-shelf":
      return <ShelfView def={entity} />;
    case "breakable-bridge":
      return <BridgeView def={entity} />;
    case "laser-gate":
      return <LaserView def={entity} />;
    case "shuttle":
      return <ShuttleView def={entity} />;
    case "timed-shutter":
      return <ShutterView def={entity} />;
    case "timed-signal":
      return <SignalView def={entity} />;
    case "exit-zone":
      return null;
    default:
      return null;
  }
}

function LevelRoom() {
  const sim = useSimulation();
  if (sim.level.id === "level-02") return <FallingKeyRoom />;
  if (sim.level.id === "level-03") return <BrokenBridgeRoom />;
  if (sim.level.id === "level-04") return <FrozenMomentRoom />;
  if (sim.level.id === "level-05") return <TwoTimelinesRoom />;
  if (sim.level.id === "level-06") return <AccelerateRoom />;
  return <Laboratory />;
}

export function LevelWorld() {
  const sim = useSimulation();
  return (
    <>
      <LevelRoom />
      <PlayerView />
      {sim.level.entities.map((entity) => (
        <EntityView key={entity.id} entity={entity} />
      ))}
    </>
  );
}
