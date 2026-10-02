"use client";

import dynamic from "next/dynamic";

const GameApp = dynamic(() => import("@/components/game/GameApp").then((mod) => mod.GameApp), {
  ssr: false,
  loading: () => (
    <div className="webgl-error">
      <p className="eyebrow">Initializing temporal core</p>
      <p>Loading simulation…</p>
    </div>
  ),
});

export function GameLoader({ levelId }: { levelId: string }) {
  return <GameApp key={levelId} levelId={levelId} />;
}
