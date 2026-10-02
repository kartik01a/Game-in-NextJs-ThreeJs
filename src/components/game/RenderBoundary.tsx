"use client";

import { Component, type ReactNode } from "react";

interface BoundaryState {
  failed: boolean;
}

export class RenderBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="webgl-error">
          <p className="eyebrow">Temporal core offline</p>
          <h1>3D rendering could not be initialized.</h1>
          <p>Update your browser or enable hardware acceleration, then reload CHRONO.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
