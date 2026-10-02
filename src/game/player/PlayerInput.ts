export interface InputFrame {
  moveX: number;
  moveZ: number;
  sprint: boolean;
  jump: boolean;
  interact: boolean;
  rewind: boolean;
  restart: boolean;
  pause: boolean;
  hint: boolean;
  debugToggle: boolean;
  toggleColliders: boolean;
  refill: boolean;
  lookX: number;
  lookY: number;
}

export const emptyInput = (): InputFrame => ({
  moveX: 0,
  moveZ: 0,
  sprint: false,
  jump: false,
  interact: false,
  rewind: false,
  restart: false,
  pause: false,
  hint: false,
  debugToggle: false,
  toggleColliders: false,
  refill: false,
  lookX: 0,
  lookY: 0,
});

/**
 * DOM keyboard/mouse state. Edges are consumed once per simulation step.
 * The simulation never stores this in React.
 */
export class InputManager {
  private readonly keys = new Set<string>();
  private readonly edges = new Set<string>();
  private lookX = 0;
  private lookY = 0;
  private listening = false;
  private target: Window | null = null;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    this.keys.add(event.code);
    this.edges.add(event.code);
    if (event.code === "Space" || event.code.startsWith("F")) {
      event.preventDefault();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private readonly onMouseMove = (event: MouseEvent) => {
    if (document.pointerLockElement) {
      this.lookX += event.movementX;
      this.lookY += event.movementY;
    }
  };

  private readonly onBlur = () => {
    this.keys.clear();
    this.edges.clear();
  };

  attach(target: Window): void {
    if (this.listening) return;
    this.listening = true;
    this.target = target;
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
    target.addEventListener("mousemove", this.onMouseMove);
    target.addEventListener("blur", this.onBlur);
  }

  detach(): void {
    if (!this.listening || !this.target) return;
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("mousemove", this.onMouseMove);
    this.target.removeEventListener("blur", this.onBlur);
    this.listening = false;
    this.target = null;
    this.keys.clear();
    this.edges.clear();
  }

  read(): InputFrame {
    const frame: InputFrame = {
      moveX: (this.keys.has("KeyD") ? 1 : 0) - (this.keys.has("KeyA") ? 1 : 0),
      moveZ: (this.keys.has("KeyW") ? 1 : 0) - (this.keys.has("KeyS") ? 1 : 0),
      sprint: this.keys.has("ShiftLeft") || this.keys.has("ShiftRight"),
      jump: this.edges.has("Space"),
      interact: this.edges.has("KeyE"),
      rewind: this.keys.has("KeyQ"),
      restart: this.edges.has("KeyR") || this.edges.has("F1"),
      pause: this.edges.has("Escape"),
      hint: this.edges.has("KeyH"),
      debugToggle: this.edges.has("F3"),
      toggleColliders: this.edges.has("F4"),
      refill: this.edges.has("F6"),
      lookX: this.lookX,
      lookY: this.lookY,
    };
    this.edges.clear();
    this.lookX = 0;
    this.lookY = 0;
    return frame;
  }
}
