"use client";

import { createContext, useContext } from "react";
import type { Simulation } from "@/game/core/Simulation";

const SimulationContext = createContext<Simulation | null>(null);

export const SimulationProvider = SimulationContext.Provider;

export function useSimulation(): Simulation {
  const simulation = useContext(SimulationContext);
  if (!simulation) throw new Error("CHRONO simulation is not mounted");
  return simulation;
}
