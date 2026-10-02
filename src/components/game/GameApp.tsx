"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AudioManager } from "@/game/audio/AudioManager";
import { Simulation } from "@/game/core/Simulation";
import { getLevel } from "@/game/levels/LevelRegistry";
import { level01 } from "@/game/levels/definitions/level-01";
import { GameCanvas } from "@/scene/GameCanvas";
import { SimulationProvider } from "@/scene/SimulationContext";
import { useHudStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { readSave } from "@/lib/storage";
import { RenderBoundary } from "@/components/game/RenderBoundary";
import { Hud } from "@/components/game-ui/Hud";

export function GameApp({ levelId }: { levelId: string }) {
  const requested = getLevel(levelId);
  const unlocked = requested?.id === "level-01" || readSave().unlockedLevels.includes(levelId);
  const allowed = Boolean(requested?.playable && unlocked);
  const level = requested && allowed ? requested : level01;

  const [sim] = useState(() => {
    useHudStore.setState({
      gameState: "BOOT",
      timeMode: "NORMAL",
      rewindEnergy: 100,
      prompt: null,
      hint: null,
      objective: level.objective,
      showObjective: true,
      levelId: level.id,
      levelName: level.name,
      levelNumber: level.number,
      completion: null,
      debugOpen: false,
      ready: false,
    });
    const simulation = new Simulation(level);
    simulation.audio = new AudioManager(() => useSettingsStore.getState());
    return simulation;
  });

  useEffect(() => {
    useSettingsStore.getState().hydrate();
  }, []);

  if (!allowed) {
    const missing = !requested?.playable;
    return (
      <main className="page">
        <p className="eyebrow">Chambers</p>
        <h1>{missing ? "Not built yet" : "Locked"}</h1>
        <p>
          {missing
            ? "This chamber is still under construction."
            : "Finish the previous chamber to open this one."}
        </p>
        <div className="page-actions">
          <Link className="button" href="/levels">
            Level select
          </Link>
        </div>
      </main>
    );
  }

  return (
    <SimulationProvider value={sim}>
      <div className="game-shell">
        <RenderBoundary>
          <GameCanvas />
        </RenderBoundary>
        <Hud />
      </div>
    </SimulationProvider>
  );
}
