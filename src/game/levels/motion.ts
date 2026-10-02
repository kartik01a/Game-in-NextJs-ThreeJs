/** Authored motion shared by rewind, local pause, and reset. */

export function beamX(age: number, amplitude: number, omega: number): number {
  return Math.sin(age * omega) * amplitude;
}

export function beamBlocks(x: number, reach: number): boolean {
  return Math.abs(x) < reach;
}

/**
 * Longest stretch, in seconds, that the beam stays outside `reach` during one period.
 */
export function clearWindow(amplitude: number, omega: number, reach: number): number {
  const period = (Math.PI * 2) / omega;
  const steps = 720;
  let longest = 0;
  let run = 0;
  for (let index = 0; index < steps; index += 1) {
    const age = (index / steps) * period;
    if (!beamBlocks(beamX(age, amplitude, omega), reach)) run += period / steps;
    else {
      longest = Math.max(longest, run);
      run = 0;
    }
  }
  return Math.max(longest, run);
}

/** Stays raised until `releaseAt`, then travels toward `lowered`. */
export function shutterY(
  age: number,
  releaseAt: number,
  raised: number,
  lowered: number,
  speed: number,
): number {
  if (age <= releaseAt) return raised;
  const distance = Math.abs(lowered - raised);
  const duration = distance / Math.max(speed, 0.001);
  const t = Math.min(1, (age - releaseAt) / duration);
  return raised + (lowered - raised) * t;
}

/** Ping-pongs from `south` to `north`, waiting `dwell` seconds at each end. */
export function shuttleZ(
  age: number,
  south: number,
  north: number,
  speed: number,
  dwell: number,
): number {
  const distance = Math.abs(north - south);
  const leg = distance / Math.max(speed, 0.001);
  const cycle = (leg + dwell) * 2;
  const t = ((age % cycle) + cycle) % cycle;
  if (t < dwell) return south;
  if (t < dwell + leg) return south + (north - south) * ((t - dwell) / leg);
  if (t < dwell * 2 + leg) return north;
  const back = (t - dwell * 2 - leg) / leg;
  return north + (south - north) * back;
}
