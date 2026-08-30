/**
 * Unified Input Manager
 * Handles Pointer/Mouse, Touch Gestures, and Keyboard navigation.
 */
export class InputManager {
  constructor(canvas, onAction) {
    this.canvas = canvas;
    this.onAction = onAction; // Callback for dispatching events
    this.isDragging = false;
    this.dragItem = null;
    this.dragOffset = { x: 0, y: 0 };
    this.touchStartTime = 0;
    this.lastTouchPos = { x: 0, y: 0 };

    this.bindEvents();
  }

  bindEvents() {
    const canvas = this.canvas;

    // Mouse / Pointer Events
    canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    window.addEventListener('pointermove', this.handlePointerMove.bind(this));
    window.addEventListener('pointerup', this.handlePointerUp.bind(this));
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleRightClick(e);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  handlePointerDown(e) {
    const coords = this.getCanvasCoords(e);
    this.touchStartTime = Date.now();
    this.lastTouchPos = coords;

    if (e.button === 2) {
      // Right click handled in contextmenu
      return;
    }

    this.onAction({
      type: 'POINTER_DOWN',
      x: coords.x,
      y: coords.y,
      button: e.button
    });
  }

  handlePointerMove(e) {
    const coords = this.getCanvasCoords(e);
    this.onAction({
      type: 'POINTER_MOVE',
      x: coords.x,
      y: coords.y
    });
  }

  handlePointerUp(e) {
    const coords = this.getCanvasCoords(e);
    const duration = Date.now() - this.touchStartTime;

    this.onAction({
      type: 'POINTER_UP',
      x: coords.x,
      y: coords.y,
      duration: duration
    });
  }

  handleRightClick(e) {
    const coords = this.getCanvasCoords(e);
    this.onAction({
      type: 'ROTATE_ACTION',
      x: coords.x,
      y: coords.y
    });
  }

  handleKeyDown(e) {
    // Ignore keys when typing inside an input/textarea
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const key = e.key.toLowerCase();

    switch (key) {
      case 'arrowup':
      case 'w':
        e.preventDefault();
        this.onAction({ type: 'MOVE', dx: 0, dy: -1 });
        break;
      case 'arrowdown':
      case 's':
        e.preventDefault();
        this.onAction({ type: 'MOVE', dx: 0, dy: 1 });
        break;
      case 'arrowleft':
      case 'a':
        e.preventDefault();
        this.onAction({ type: 'MOVE', dx: -1, dy: 0 });
        break;
      case 'arrowright':
      case 'd':
        e.preventDefault();
        this.onAction({ type: 'MOVE', dx: 1, dy: 0 });
        break;
      case 'r':
        e.preventDefault();
        this.onAction({ type: 'ROTATE_SELECTED' });
        break;
      case ' ':
        e.preventDefault();
        this.onAction({ type: 'LOOP_ACTION' }); // Trigger Time-Loop or test run
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey || !e.ctrlKey) {
          e.preventDefault();
          this.onAction({ type: 'UNDO' });
        }
        break;
      case 'h':
        e.preventDefault();
        this.onAction({ type: 'HINT' });
        break;
      case 'm':
        e.preventDefault();
        this.onAction({ type: 'TOGGLE_MUTE' });
        break;
      case 'escape':
        this.onAction({ type: 'ESCAPE' });
        break;
    }
  }
}
