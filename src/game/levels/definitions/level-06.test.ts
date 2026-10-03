import { describe, expect, it } from "vitest";
import { doorOpenSeconds, ride06 } from "./level-06";

describe("accelerate timing", () => {
  const travel = (ride06.north - ride06.south) / ride06.speed;

  it("misses the lamp when the ferry runs at normal speed", () => {
    const arrival = ride06.dwell + travel;
    expect(arrival).toBeGreaterThan(ride06.closeAt);
  });

  it("reaches the open gate when only the crossing is hasted", () => {
    const arrival = ride06.dwell + travel / 3;
    expect(arrival).toBeGreaterThan(ride06.openAt + doorOpenSeconds);
    expect(arrival).toBeLessThan(ride06.closeAt);
  });
});
