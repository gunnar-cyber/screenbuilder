export class Rotatable {
  element: HTMLElement | null = null;
  center: { x: number; y: number } | null = null;
  active = false;
  onRotationStart: any = null;
  onRotating: any = null;
  onRotationEnd: any = null;
  currentRotation: number = 0;
  private updateRequest = 0;
  private listenersAdded = false;
  private lastPointerPosition: { x: number; y: number } | null = null;

  // For rotation mode
  private _rotation = 0;
  private minimumRotationChange = 20; // Call onRotating only when rotated more than this limit
  private lastPointerAngle: number | null = null;
  private lastUpdatedRotation = 0;

  constructor(options: any, element: HTMLElement) {
    this.element = element;

    this.loadOptions(options);
    this.addListeners();
  }

  public destroy() {
    this.removeListeners();
    this.element = null;
    this.onRotationStart = null;
    this.onRotating = null;
    this.onRotationEnd = null;
    this.dragEnd();
  }

  get rotation(): number {
    return this._rotation;
  }

  set rotation(newRotation: number) {
    this._rotation = newRotation;
    this.element!.style.transform = `rotate(${this._rotation % 360}deg)`;
  }

  enabled(enable: boolean) {
    if (enable && !this.listenersAdded) {
      this.addListeners();
    } else if (!enable && this.listenersAdded) {
      this.removeListeners();
    }
  }

  // ===================================================================================================================
  // private methods
  // ===================================================================================================================

  private loadOptions(options: any) {
    if (options) {
      this.onRotationStart = options.onRotationStart;
      this.onRotating = options.onRotating;
      this.onRotationEnd = options.onRotationEnd;
      if ("minimumRotationChange" in options) {
        this.minimumRotationChange = parseFloat(options.minimumRotationChange);
      }
    }
  }

  private addListeners() {
    this.element!.addEventListener("touchstart", this.dragStart);
    this.element!.addEventListener("touchmove", this.dragging);
    this.element!.addEventListener("touchend", this.dragEnd);
    this.element!.addEventListener("touchcancel", this.dragEnd);
    this.element!.addEventListener("mousedown", this.mouseDown);
    // prevent the element from responding to dragstart event
    this.element!.addEventListener("dragstart", this.returnFalse);

    this.listenersAdded = true;
  }

  private removeListeners() {
    this.listenersAdded = false;

    this.element!.removeEventListener("touchstart", this.dragStart);
    this.element!.removeEventListener("touchmove", this.dragging);
    this.element!.removeEventListener("touchend", this.dragEnd);
    this.element!.removeEventListener("touchcancel", this.dragEnd);
    this.element!.removeEventListener("mousedown", this.mouseDown);
    this.element!.removeEventListener("mousedown", this.dragStart);
    this.element!.removeEventListener("mousemove", this.dragging);
    this.element!.removeEventListener("mouseup", this.mouseUp);

    this.element!.removeEventListener("dragstart", this.returnFalse);
  }

  private mouseDown = () => {
    // This is to continue rotation when mouse moves outside the rotating element
    this.dragStart();
    this.element!.ownerDocument.addEventListener("mousemove", this.dragging);
    this.element!.ownerDocument.addEventListener("mouseup", this.mouseUp);
  };

  private mouseUp = () => {
    this.element!.ownerDocument.removeEventListener("mousemove", this.dragging);
    this.element!.ownerDocument.removeEventListener("mouseup", this.mouseUp);
    this.dragEnd();
  };

  private dragStart = () => {
    this.active = true;

    this.lastPointerPosition = null;
    this.lastPointerAngle = null;

    const rect = this.element!.getBoundingClientRect();
    this.center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    if (this.onRotationStart != null) {
      this.onRotationStart();
    }
    this.update();
  };

  private dragEnd = () => {
    if (!this.active) return;
    this.active = false;
    if (this.onRotationEnd != null) {
      this.onRotationEnd();
    }
    cancelAnimationFrame(this.updateRequest!);
  };

  private dragging = (event: MouseEvent | TouchEvent) => {
    if (!this.active) return;

    event.preventDefault();
    event.stopPropagation();

    if ("targetTouches" in event) {
      if (event.targetTouches.length > 0) {
        // Touch
        this.lastPointerPosition = {
          x: event.targetTouches[0].clientX,
          y: event.targetTouches[0].clientY
        };
      }
    } else {
      // Mouse event
      this.lastPointerPosition = { x: event.clientX, y: event.clientY };
    }
  };

  private update = () => {
    if (this.lastPointerPosition != null && this.active) {
      const triggerDrag = this.updateRotation();
      if (triggerDrag && this.onRotating != null) {
        this.onRotating();
      }
    }
    this.updateRequest = requestAnimationFrame(this.update);
  };

  private updateRotation(): boolean {
    const newPointerAngle = this.calculatePointerAngle(this.center!);

    if (this.lastPointerAngle == null) {
      this.lastPointerAngle = newPointerAngle;
    }
    let angleDiff = newPointerAngle - this.lastPointerAngle;
    // Get the pointer rotation angle in range [-π, π]
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    this.lastPointerAngle = newPointerAngle;
    const degreeDiff = Math.round((angleDiff / Math.PI) * 180 * 100) / 100;
    this.currentRotation = this.rotation;
    this.rotation += degreeDiff;

    if (
      Math.abs(this._rotation - this.lastUpdatedRotation) >=
      this.minimumRotationChange
    ) {
      this.lastUpdatedRotation = this._rotation;
      return true;
    }
    return false;
  }

  private calculatePointerAngle(center: { x: number, y: number}): number {
    const angle = Math.atan2(
      this.lastPointerPosition!.y - center.y,
      this.lastPointerPosition!.x - center.x
    );
    return angle + Math.PI; // Offset the angle so it ranges from 0 to 2π clockwise
  }

  private returnFalse() {
    return false;
  }
}
