/**
 * Chrono-Paradox Engine
 * Simulates temporal loops with ghost clone recording and simultaneous cooperative playback.
 */
export class ChronoEngine {
  constructor(levelData) {
    this.init(levelData);
  }

  init(levelData) {
    this.cols = levelData.cols || 8;
    this.rows = levelData.rows || 8;
    this.title = levelData.title || 'Chrono Paradox';
    this.maxTimelineSteps = levelData.maxTimelineSteps || 25;
    this.maxClones = levelData.maxClones || 2;
    this.targetMoves = levelData.targetMoves || 15;
    this.hints = levelData.hints || [
      'Walk onto a pressure plate in Timeline 1 to open the security door.',
      'Press LOOP REWIND (Spacebar) to spawn your ghost clone who will hold the plate for you in Timeline 2!'
    ];

    this.playerStart = { ...levelData.playerStart };
    this.player = { ...this.playerStart };
    this.exitPortal = { ...levelData.exitPortal };

    this.walls = JSON.parse(JSON.stringify(levelData.walls || []));
    this.plates = JSON.parse(JSON.stringify(levelData.plates || [])); // { id, x, y, doorId }
    this.doors = JSON.parse(JSON.stringify(levelData.doors || []));   // { id, x, y, isOpen }
    this.batteries = JSON.parse(JSON.stringify(levelData.batteries || [])); // { id, x, y }

    // Initial state storage for clean loop rewind
    this.initialDoors = JSON.parse(JSON.stringify(this.doors));
    this.initialBatteries = JSON.parse(JSON.stringify(this.batteries));

    // Timeline recording
    this.currentTimelineIndex = 0; // 0 = first run, 1 = 1 ghost clone, etc.
    this.recordedTimelines = [];   // Array of action arrays per loop
    this.currentRecordedSteps = []; // Current timeline actions: [{ x, y }]

    this.currentTimeStep = 0;
    this.isSolved = false;
    this.totalMoves = 0;

    // Record initial step
    this.currentRecordedSteps.push({ x: this.player.x, y: this.player.y });
    this.updateWorldState();
  }

  // Update pressure plates & doors state based on positions of player, ghosts, and batteries
  updateWorldState() {
    // Reset plates
    this.plates.forEach(p => p.isPressed = false);

    // Get current positions of player and active ghosts at currentTimeStep
    const activeEntities = [{ x: this.player.x, y: this.player.y }];

    // Ghosts
    this.recordedTimelines.forEach(timeline => {
      const stepIdx = Math.min(this.currentTimeStep, timeline.length - 1);
      if (timeline[stepIdx]) {
        activeEntities.push(timeline[stepIdx]);
      }
    });

    // Batteries
    this.batteries.forEach(b => activeEntities.push({ x: b.x, y: b.y }));

    // Check plates
    this.plates.forEach(p => {
      const isOccupied = activeEntities.some(e => e.x === p.x && e.y === p.y);
      p.isPressed = isOccupied;
    });

    // Update doors
    this.doors.forEach(d => {
      // Door is open if any linked plate is pressed
      const linkedPlates = this.plates.filter(p => p.doorId === d.id);
      d.isOpen = linkedPlates.some(p => p.isPressed);
    });

    // Check win condition: Live player reached the exit portal while open
    if (this.player.x === this.exitPortal.x && this.player.y === this.exitPortal.y) {
      this.isSolved = true;
    }
  }

  // Try moving live player by dx, dy
  movePlayer(dx, dy) {
    if (this.isSolved) return false;
    if (this.currentTimeStep >= this.maxTimelineSteps) return false;

    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    // Check grid boundary
    if (targetX < 0 || targetX >= this.cols || targetY < 0 || targetY >= this.rows) {
      return false;
    }

    // Check walls
    if (this.walls.some(w => w.x === targetX && w.y === targetY)) {
      return false;
    }

    // Check closed doors
    const door = this.doors.find(d => d.x === targetX && d.y === targetY);
    if (door && !door.isOpen) {
      return false;
    }

    // Check pushable battery
    const battery = this.batteries.find(b => b.x === targetX && b.y === targetY);
    if (battery) {
      const pushX = targetX + dx;
      const pushY = targetY + dy;

      // Check battery push bounds
      if (pushX < 0 || pushX >= this.cols || pushY < 0 || pushY >= this.rows) return false;
      if (this.walls.some(w => w.x === pushX && w.y === pushY)) return false;
      if (this.doors.some(d => d.x === pushX && d.y === pushY && !d.isOpen)) return false;
      if (this.batteries.some(b => b.x === pushX && b.y === pushY)) return false;

      // Push battery
      battery.x = pushX;
      battery.y = pushY;
    }

    // Advance player position & timeline
    this.player.x = targetX;
    this.player.y = targetY;
    this.currentTimeStep++;
    this.totalMoves++;

    this.currentRecordedSteps.push({ x: this.player.x, y: this.player.y });
    this.updateWorldState();
    return true;
  }

  // Trigger Paradox Loop / Rewind: Save current run as ghost clone and restart from t=0
  triggerParadoxLoop() {
    if (this.recordedTimelines.length >= this.maxClones) {
      // Reached max clones, reset from loop 0
      this.resetAll();
      return false;
    }

    // Save current recording
    this.recordedTimelines.push(JSON.parse(JSON.stringify(this.currentRecordedSteps)));
    this.currentTimelineIndex++;

    // Reset player to start
    this.player = { ...this.playerStart };
    this.currentTimeStep = 0;
    this.currentRecordedSteps = [{ x: this.player.x, y: this.player.y }];

    // Reset batteries & doors to initial
    this.doors = JSON.parse(JSON.stringify(this.initialDoors));
    this.batteries = JSON.parse(JSON.stringify(this.initialBatteries));

    this.updateWorldState();
    return true;
  }

  // Get active ghost clone positions at current time step
  getGhostPositions() {
    const ghosts = [];
    this.recordedTimelines.forEach((timeline, idx) => {
      const stepIdx = Math.min(this.currentTimeStep, timeline.length - 1);
      if (timeline[stepIdx]) {
        ghosts.push({
          x: timeline[stepIdx].x,
          y: timeline[stepIdx].y,
          index: idx
        });
      }
    });
    return ghosts;
  }

  resetAll() {
    this.player = { ...this.playerStart };
    this.currentTimeStep = 0;
    this.currentTimelineIndex = 0;
    this.recordedTimelines = [];
    this.currentRecordedSteps = [{ x: this.player.x, y: this.player.y }];
    this.doors = JSON.parse(JSON.stringify(this.initialDoors));
    this.batteries = JSON.parse(JSON.stringify(this.initialBatteries));
    this.isSolved = false;
    this.updateWorldState();
  }

  getStarRating() {
    if (!this.isSolved) return 0;
    if (this.totalMoves <= this.targetMoves) return 3;
    if (this.totalMoves <= this.targetMoves + 8) return 2;
    return 1;
  }
}
