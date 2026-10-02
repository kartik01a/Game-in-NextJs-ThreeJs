export type GameEventMap = {
  SWITCH_ACTIVATED: { id: string };
  SWITCH_DEACTIVATED: { id: string };
  PRESSURE_PLATE_PRESSED: { id: string };
  PRESSURE_PLATE_RELEASED: { id: string };
  DOOR_OPENED: { id: string };
  DOOR_CLOSED: { id: string };
  REWIND_STARTED: { time: number };
  REWIND_ENDED: { time: number };
  LEVEL_COMPLETED: { levelId: string; elapsed: number; rewindUsed: number };
  LEVEL_RESTARTED: { levelId: string };
};

type Handler<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void;

export class EventBus {
  private readonly handlers = new Map<keyof GameEventMap, Set<Handler<keyof GameEventMap>>>();

  on<K extends keyof GameEventMap>(type: K, handler: Handler<K>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler as Handler<keyof GameEventMap>);
    return () => {
      set?.delete(handler as Handler<keyof GameEventMap>);
    };
  }

  emit<K extends keyof GameEventMap>(type: K, payload: GameEventMap[K]): void {
    const set = this.handlers.get(type);
    if (!set) return;
    for (const handler of set) {
      (handler as Handler<K>)(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
