const shuttles = new WeakSet<object>();

export function markShuttle(collider: object): void {
  shuttles.add(collider);
}

export function isShuttleCollider(collider: object): boolean {
  return shuttles.has(collider);
}
