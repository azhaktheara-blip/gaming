/**
 * Quantum Optics Raycasting & Physics Engine
 * Traces light beams across grid elements: mirrors, splitters, filters, logic gates, portals, and receptors.
 */
export class OpticsEngine {
  constructor(levelData) {
    this.init(levelData);
  }

  init(levelData) {
    this.cols = levelData.cols || 8;
    this.rows = levelData.rows || 8;
    this.title = levelData.title || 'Quantum Circuit';
    this.targetMoves = levelData.targetMoves || 10;
    this.hints = levelData.hints || [
      'Position mirrors to reflect laser beams into matching color receptors.',
      'Right-click or tap a mirror to rotate its reflection angle.',
      'Check beam colors carefully. Some receptors require filtered light.'
    ];

    // Grid matrix
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
    this.inventory = JSON.parse(JSON.stringify(levelData.inventory || []));
    this.emitters = JSON.parse(JSON.stringify(levelData.emitters || []));
    this.receptors = JSON.parse(JSON.stringify(levelData.receptors || []));
    this.fixedItems = JSON.parse(JSON.stringify(levelData.fixedItems || []));

    // Place fixed elements on grid
    this.fixedItems.forEach(item => {
      if (item.x >= 0 && item.x < this.cols && item.y >= 0 && item.y < this.rows) {
        this.grid[item.y][item.x] = { ...item, isFixed: true };
      }
    });

    // Place pre-placed placedItems if any
    if (levelData.placedItems) {
      levelData.placedItems.forEach(item => {
        if (item.x >= 0 && item.x < this.cols && item.y >= 0 && item.y < this.rows) {
          this.grid[item.y][item.x] = { ...item, isFixed: false };
        }
      });
    }

    this.rays = [];
    this.moveHistory = [];
    this.moves = 0;
    this.isSolved = false;

    this.calculateRays();
  }

  // Direction helpers (0: Right, 1: Down, 2: Left, 3: Up)
  getDirVector(dir) {
    const vectors = [
      { dx: 1, dy: 0 },   // 0: Right
      { dx: 0, dy: 1 },   // 1: Down
      { dx: -1, dy: 0 },  // 2: Left
      { dx: 0, dy: -1 }   // 3: Up
    ];
    return vectors[(dir % 4 + 4) % 4];
  }

  // Calculate reflection from angle (45, 135, 225, 315)
  getReflection(angle, inDir) {
    const normAngle = ((angle % 360) + 360) % 360;
    
    // Angle 45° (or 225°): Diagonal from bottom-left to top-right
    if (normAngle === 45 || normAngle === 225) {
      if (inDir === 0) return 3; // Right -> Up
      if (inDir === 1) return 2; // Down -> Left
      if (inDir === 2) return 1; // Left -> Down
      if (inDir === 3) return 0; // Up -> Right
    }

    // Angle 135° (or 315°): Diagonal from top-left to bottom-right
    if (normAngle === 135 || normAngle === 315) {
      if (inDir === 0) return 1; // Right -> Down
      if (inDir === 1) return 0; // Down -> Right
      if (inDir === 2) return 3; // Left -> Up
      if (inDir === 3) return 2; // Up -> Left
    }

    return null;
  }

  // Filter light color
  filterColor(beamColor, filterColor) {
    if (beamColor === filterColor || beamColor === 'white') return filterColor;
    
    // Subtractive / additive mixing rules
    const colorChannels = {
      red: { r: 1, g: 0, b: 0 },
      green: { r: 0, g: 1, b: 0 },
      blue: { r: 0, g: 0, b: 1 },
      yellow: { r: 1, g: 1, b: 0 },
      magenta: { r: 1, g: 0, b: 1 },
      cyan: { r: 0, g: 1, b: 1 },
      white: { r: 1, g: 1, b: 1 }
    };

    const b = colorChannels[beamColor] || { r: 1, g: 1, b: 1 };
    const f = colorChannels[filterColor] || { r: 1, g: 1, b: 1 };

    const r = b.r && f.r ? 1 : 0;
    const g = b.g && f.g ? 1 : 0;
    const bl = b.b && f.b ? 1 : 0;

    if (r && g && bl) return 'white';
    if (r && g) return 'yellow';
    if (r && bl) return 'magenta';
    if (g && bl) return 'cyan';
    if (r) return 'red';
    if (g) return 'green';
    if (bl) return 'blue';
    return null; // Absorbed/blocked
  }

  // Recalculate all laser beam paths across the matrix
  calculateRays() {
    this.rays = [];
    const maxSteps = 100;

    // Reset receptor powered status
    this.receptors.forEach(rec => rec.powered = false);

    // Queue of beam segments to trace: { x, y, dir, color }
    const queue = [];
    this.emitters.forEach(e => {
      const vec = this.getDirVector(e.dir);
      queue.push({
        x: e.x,
        y: e.y,
        dir: e.dir,
        color: e.color || 'cyan'
      });
    });

    const visitedPaths = new Set();

    while (queue.length > 0) {
      const ray = queue.shift();
      let cx = ray.x;
      let cy = ray.y;
      let dir = ray.dir;
      let color = ray.color;

      const pathKey = `${cx},${cy},${dir},${color}`;
      if (visitedPaths.has(pathKey)) continue;
      visitedPaths.add(pathKey);

      let stepCount = 0;

      while (stepCount++ < maxSteps) {
        const vec = this.getDirVector(dir);
        const nextX = cx + vec.dx;
        const nextY = cy + vec.dy;

        // Check bounds
        if (nextX < 0 || nextX >= this.cols || nextY < 0 || nextY >= this.rows) {
          this.rays.push({
            startX: cx,
            startY: cy,
            endX: cx + vec.dx * 0.6,
            endY: cy + vec.dy * 0.6,
            color
          });
          break;
        }

        // Check if there is a receptor at (nextX, nextY)
        const receptor = this.receptors.find(r => r.x === nextX && r.y === nextY);
        if (receptor) {
          this.rays.push({ startX: cx, startY: cy, endX: nextX, endY: nextY, color });
          if (receptor.color === color || receptor.color === 'any' || color === 'white') {
            receptor.powered = true;
          }
          break;
        }

        // Check grid element
        const cell = this.grid[nextY][nextX];

        if (!cell) {
          // Empty cell: continue ray
          this.rays.push({ startX: cx, startY: cy, endX: nextX, endY: nextY, color });
          cx = nextX;
          cy = nextY;
          continue;
        }

        // Cell has an optical element
        this.rays.push({ startX: cx, startY: cy, endX: nextX, endY: nextY, color });
        cx = nextX;
        cy = nextY;

        if (cell.type === 'mirror') {
          const newDir = this.getReflection(cell.angle || 45, dir);
          if (newDir !== null) {
            dir = newDir;
          } else {
            break; // Absorbed on back
          }
        } else if (cell.type === 'splitter') {
          // Passes 1 beam forward and reflects 1 beam at 90 deg
          const reflectedDir = this.getReflection(cell.angle || 45, dir);
          if (reflectedDir !== null) {
            queue.push({ x: cx, y: cy, dir: reflectedDir, color });
          }
          // Continue straight
        } else if (cell.type === 'filter') {
          const filtered = this.filterColor(color, cell.filterColor || 'cyan');
          if (filtered) {
            color = filtered;
          } else {
            break; // Light absorbed completely
          }
        } else if (cell.type === 'portal') {
          // Find paired portal
          let paired = null;
          for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
              const item = this.grid[r][c];
              if (item && item.type === 'portal' && item.portalId === cell.portalId && (c !== cx || r !== cy)) {
                paired = { x: c, y: r };
                break;
              }
            }
          }
          if (paired) {
            queue.push({ x: paired.x, y: paired.y, dir, color });
          }
          break;
        } else if (cell.type === 'blocker') {
          break; // Metallic wall blocks laser
        }
      }
    }

    // Check level win condition: All receptors must be powered
    this.isSolved = this.receptors.length > 0 && this.receptors.every(r => r.powered);
    return this.isSolved;
  }

  // Place item from inventory or reposition
  placeItem(type, x, y, angle = 45, filterColor = 'cyan', portalId = 1) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    
    // Check if cell is occupied by fixed emitter or receptor
    if (this.emitters.some(e => e.x === x && e.y === y)) return false;
    if (this.receptors.some(r => r.x === x && r.y === y)) return false;

    const existing = this.grid[y][x];
    if (existing && existing.isFixed) return false;

    this.saveState();

    // If taking from inventory, decrement inventory count
    const invItem = this.inventory.find(i => i.type === type);
    if (invItem && invItem.count > 0 && !existing) {
      invItem.count--;
    }

    // Place on grid
    this.grid[y][x] = {
      type,
      angle,
      filterColor,
      portalId,
      isFixed: false
    };

    this.moves++;
    this.calculateRays();
    return true;
  }

  // Rotate piece at (x, y)
  rotateItem(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    const item = this.grid[y][x];
    if (!item || item.isFixed) return false;

    this.saveState();

    if (item.type === 'mirror' || item.type === 'splitter' || item.type === 'filter') {
      item.angle = ((item.angle || 45) + 90) % 360;
      this.moves++;
      this.calculateRays();
      return true;
    }
    return false;
  }

  // Remove item back to inventory
  removeItem(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    const item = this.grid[y][x];
    if (!item || item.isFixed) return false;

    this.saveState();

    // Return to inventory
    const invItem = this.inventory.find(i => i.type === item.type);
    if (invItem) {
      invItem.count++;
    }

    this.grid[y][x] = null;
    this.moves++;
    this.calculateRays();
    return true;
  }

  saveState() {
    this.moveHistory.push({
      grid: JSON.parse(JSON.stringify(this.grid)),
      inventory: JSON.parse(JSON.stringify(this.inventory)),
      moves: this.moves
    });
    if (this.moveHistory.length > 50) this.moveHistory.shift();
  }

  undo() {
    if (this.moveHistory.length === 0) return false;
    const prev = this.moveHistory.pop();
    this.grid = prev.grid;
    this.inventory = prev.inventory;
    this.moves = prev.moves;
    this.calculateRays();
    return true;
  }

  getStarRating() {
    if (!this.isSolved) return 0;
    if (this.moves <= this.targetMoves) return 3;
    if (this.moves <= this.targetMoves + 4) return 2;
    return 1;
  }
}
