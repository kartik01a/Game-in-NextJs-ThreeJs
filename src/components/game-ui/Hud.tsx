"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { gameConfig } from "@/game/core/GameConfig";
import { getLevel } from "@/game/levels/LevelRegistry";
import { formatDuration } from "@/lib/math";
import { useHudStore } from "@/store/gameStore";
import { useSimulation } from "@/scene/SimulationContext";

export function Hud() {
  const hud = useHudStore();
  const sim = useSimulation();
  const [locked, setLocked] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const energy = Math.max(0, Math.min(100, hud.rewindEnergy));
  const rewinding = hud.timeMode === "REWINDING";
  const canFreeze = sim.level.requiredAbilities.includes("local-pause");
  const canHaste = sim.level.requiredAbilities.includes("fast-forward");
  const hasting = canHaste && hud.timeMode === "FAST_FORWARDING";
  const freezeLeft = Math.max(0, hud.localPause);
  const frozen = canFreeze && freezeLeft > 0.05;
  const freezeRatio = frozen ? Math.min(1, freezeLeft / gameConfig.localPauseDuration) : canFreeze ? 1 : 0;
  const next = sim.level.nextLevelId ? getLevel(sim.level.nextLevelId) : undefined;
  const nextChamber = next?.playable ? next : undefined;

  useEffect(() => {
    const sync = () => setLocked(document.pointerLockElement !== null);
    document.addEventListener("pointerlockchange", sync);
    const query = window.matchMedia("(pointer: coarse)");
    const syncPointer = () => setCoarse(query.matches && window.innerWidth < 900);
    syncPointer();
    query.addEventListener("change", syncPointer);
    return () => {
      document.removeEventListener("pointerlockchange", sync);
      query.removeEventListener("change", syncPointer);
    };
  }, []);

  return (
    <div className={`hud ${rewinding ? "is-rewinding" : ""} ${frozen ? "is-frozen" : ""} ${hasting ? "is-hasting" : ""}`}>
      <header className="hud-top">
        <p className="eyebrow">Level {String(hud.levelNumber).padStart(2, "0")}</p>
        <h1>{hud.levelName}</h1>
        {hud.showObjective ? <p className="objective">{hud.objective}</p> : null}
      </header>

      <div className="hud-energy" aria-live="polite">
        <div className="energy-label">
          <span>[Q] REWIND</span>
          <span>{Math.round(energy)}%</span>
        </div>
        <div className="energy-track" aria-hidden="true">
          <div className="energy-fill" style={{ width: `${energy}%` }} />
        </div>
        {canFreeze ? (
          <>
            <div className="energy-label freeze-label">
              <span>[F] FREEZE</span>
              <span>{frozen ? `${freezeLeft.toFixed(1)}s` : "READY"}</span>
            </div>
            <div className="energy-track" aria-hidden="true">
              <div className="freeze-fill" style={{ width: `${freezeRatio * 100}%` }} />
            </div>
          </>
        ) : null}
        {canHaste ? (
          <div className="energy-label freeze-label">
            <span>[C] HASTE</span>
            <span>{hasting ? "3x" : "READY"}</span>
          </div>
        ) : null}
      </div>

      {hud.prompt ? <p className="prompt">{hud.prompt}</p> : null}
      {hud.hint ? <p className="hint">{hud.hint}</p> : null}

      {!locked && hud.gameState === "PLAYING" ? (
        <p className="look-hint">
          Click to look · WASD move · Shift sprint · Space jump
          {canFreeze ? " · F freeze" : ""}
          {canHaste ? " · C haste" : ""} · H hints
        </p>
      ) : null}

      {rewinding ? <div className="rewind-veil" aria-hidden="true" /> : null}
      {frozen && !rewinding ? <div className="freeze-veil" aria-hidden="true" /> : null}
      {hasting && !rewinding ? <div className="haste-veil" aria-hidden="true" /> : null}
      {coarse ? (
        <div className="mobile-notice">
          <p>CHRONO is currently optimized for desktop keyboard and mouse.</p>
          <p>Mobile support is planned for a future version.</p>
        </div>
      ) : null}

      {hud.gameState === "PAUSED" ? (
        <div className="menu-card">
          <p className="eyebrow">Paused</p>
          <h2>Temporal hold</h2>
          <button type="button" onClick={() => sim.togglePause()}>
            Resume
          </button>
          <button type="button" onClick={() => sim.reset()}>
            Restart chamber
          </button>
          <Link href="/settings">Settings</Link>
          <Link href="/">Exit to menu</Link>
          <p className="fine">Restart refills temporal energy.</p>
        </div>
      ) : null}

      {hud.completion ? (
        <div className="menu-card complete">
          <p className="eyebrow">Temporal stability restored</p>
          <h2>Level complete</h2>
          <p>
            Time {formatDuration(hud.completion.elapsed)} · Rewind {hud.completion.rewindUsed.toFixed(1)}s
          </p>
          <button type="button" onClick={() => sim.reset()}>
            Replay
          </button>
          {nextChamber ? <Link href={`/game?level=${nextChamber.id}`}>Next chamber</Link> : null}
          <Link href="/levels">Levels</Link>
          <Link href="/">Menu</Link>
        </div>
      ) : null}

      {!hud.ready ? (
        <div className="loading-card">
          <p className="eyebrow">Initializing temporal core</p>
          <p>Preparing timeline…</p>
        </div>
      ) : null}

      <DebugReadout open={hud.debugOpen} />
    </div>
  );
}

function DebugReadout({ open }: { open: boolean }) {
  const sim = useSimulation();
  useEffect(() => {
    if (!open) sim.setDebugElement(null);
    return () => sim.setDebugElement(null);
  }, [open, sim]);

  if (!open || !sim.devTools) return null;
  return (
    <pre
      className="debug-panel"
      ref={(node) => {
        sim.setDebugElement(node);
      }}
    />
  );
}
