"use client";

import type { EntityDefinition } from "@/game/levels/types";
import { useSimulation } from "@/scene/SimulationContext";
import { BoxView } from "@/scene/entities/BoxView";
import { DoorView } from "@/scene/entities/DoorView";
import { PlateView } from "@/scene/entities/PlateView";
import { PlayerView } from "@/scene/entities/PlayerView";
import { ShelfView } from "@/scene/entities/ShelfView";
import { SwitchView } from "@/scene/entities/SwitchView";
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
    case "exit-zone":
      return null;
    default:
      return null;
  }
}

export function LevelWorld() {
  const sim = useSimulation();
  return (
    <>
      {sim.level.id === "level-02" ? <FallingKeyRoom /> : <Laboratory />}
      <PlayerView />
      {sim.level.entities.map((entity) => (
        <EntityView key={entity.id} entity={entity} />
      ))}
    </>
  );
}
