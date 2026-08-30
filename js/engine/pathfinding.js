/**
 * A* Grid Pathfinding Engine
 * Computes shortest paths around village structures and evaluates wall detour weights.
 */

export class PathfindingEngine {
  constructor(gridSize = 36) {
    this.gridSize = gridSize;
  }

  // Generate cost map from active buildings and walls
  buildCostGrid(buildings, walls) {
    const grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(1)); // Base cost 1

    // Buildings block tiles
    for (const b of buildings) {
      if (b.hp <= 0) continue;
      for (let r = 0; r < b.height; r++) {
        for (let c = 0; c < b.width; c++) {
          const gx = b.x + c;
          const gy = b.y + r;
          if (gx >= 0 && gx < this.gridSize && gy >= 0 && gy < this.gridSize) {
            grid[gy][gx] = 999; // Impassable building
          }
        }
      }
    }

    // Active walls add heavy detour cost
    for (const w of walls) {
      if (w.hp <= 0) continue;
      if (w.x >= 0 && w.x < this.gridSize && w.y >= 0 && w.y < this.gridSize) {
        grid[w.y][w.x] = 25; // High cost for wall (troops prefer going around open gates unless detour is huge)
      }
    }

    return grid;
  }

  findPath(startX, startY, endX, endY, avoidBuildings = true) {
    const sx = Math.max(0, Math.min(this.gridSize - 1, Math.floor(startX)));
    const sy = Math.max(0, Math.min(this.gridSize - 1, Math.floor(startY)));
    const ex = Math.max(0, Math.min(this.gridSize - 1, Math.floor(endX)));
    const ey = Math.max(0, Math.min(this.gridSize - 1, Math.floor(endY)));

    if (sx === ex && sy === ey) {
      return [{ x: endX, y: endY }];
    }

    // Open & Closed Sets
    const openSet = [{ x: sx, y: sy, g: 0, h: this.heuristic(sx, sy, ex, ey), f: this.heuristic(sx, sy, ex, ey), parent: null }];
    const closedSet = new Set();
    const nodeMap = new Map();
    nodeMap.set(`${sx},${sy}`, openSet[0]);

    const neighbors = [
      { dx: 1, dy: 0, cost: 1 },
      { dx: -1, dy: 0, cost: 1 },
      { dx: 0, dy: 1, cost: 1 },
      { dx: 0, dy: -1, cost: 1 },
      { dx: 1, dy: 1, cost: 1.414 },
      { dx: -1, dy: 1, cost: 1.414 },
      { dx: 1, dy: -1, cost: 1.414 },
      { dx: -1, dy: -1, cost: 1.414 }
    ];

    let iterations = 0;
    const maxIterations = 800;

    while (openSet.length > 0 && iterations++ < maxIterations) {
      // Get lowest f score
      let lowestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIdx].f) {
          lowestIdx = i;
        }
      }

      const current = openSet.splice(lowestIdx, 1)[0];
      const currentKey = `${current.x},${current.y}`;
      closedSet.add(currentKey);

      // Reached destination or adjacent to building
      if (Math.hypot(current.x - ex, current.y - ey) <= 1.2) {
        return this.reconstructPath(current, endX, endY);
      }

      for (const n of neighbors) {
        const nx = current.x + n.dx;
        const ny = current.y + n.dy;

        if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) continue;

        const nKey = `${nx},${ny}`;
        if (closedSet.has(nKey)) continue;

        const tentG = current.g + n.cost;

        let existing = nodeMap.get(nKey);
        if (!existing) {
          existing = {
            x: nx,
            y: ny,
            g: tentG,
            h: this.heuristic(nx, ny, ex, ey),
            f: tentG + this.heuristic(nx, ny, ex, ey),
            parent: current
          };
          nodeMap.set(nKey, existing);
          openSet.push(existing);
        } else if (tentG < existing.g) {
          existing.g = tentG;
          existing.f = tentG + existing.h;
          existing.parent = current;
        }
      }
    }

    // Direct line fallback if no path found
    return [{ x: endX, y: endY }];
  }

  heuristic(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  reconstructPath(node, targetX, targetY) {
    const path = [{ x: targetX, y: targetY }];
    let curr = node;
    while (curr) {
      path.unshift({ x: curr.x + 0.5, y: curr.y + 0.5 });
      curr = curr.parent;
    }
    return path;
  }
}
