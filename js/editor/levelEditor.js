/**
 * Level Studio / Custom Puzzle Builder
 * Enables players to construct custom optics & chrono puzzles, test them live, and export/import share codes.
 */
import { storage } from '../engine/storage.js';

export class LevelEditor {
  constructor(onTestCallback) {
    this.onTestCallback = onTestCallback;
    this.activeTool = 'mirror'; // mirror, splitter, filter, emitter, receptor, blocker, eraser
    this.selectedColor = 'cyan';
    this.selectedAngle = 45;
    this.selectedDir = 0;

    this.cols = 8;
    this.rows = 8;
    this.customLevel = this.createEmptyLevel();
  }

  createEmptyLevel() {
    return {
      id: 'custom_' + Date.now(),
      title: 'Custom Quantum Puzzle',
      difficulty: 'Custom',
      cols: this.cols,
      rows: this.rows,
      targetMoves: 6,
      hints: ['Custom puzzle created in Level Studio.'],
      emitters: [],
      receptors: [],
      inventory: [
        { type: 'mirror', count: 4 },
        { type: 'splitter', count: 1 }
      ],
      fixedItems: []
    };
  }

  setTool(tool) {
    this.activeTool = tool;
  }

  setColor(color) {
    this.selectedColor = color;
  }

  setAngle(angle) {
    this.selectedAngle = angle;
  }

  setDir(dir) {
    this.selectedDir = dir;
  }

  handleGridClick(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;

    // Erase existing at (x, y)
    this.customLevel.emitters = this.customLevel.emitters.filter(e => e.x !== x || e.y !== y);
    this.customLevel.receptors = this.customLevel.receptors.filter(r => r.x !== x || r.y !== y);
    this.customLevel.fixedItems = this.customLevel.fixedItems.filter(f => f.x !== x || f.y !== y);

    if (this.activeTool === 'eraser') {
      return;
    }

    if (this.activeTool === 'emitter') {
      this.customLevel.emitters.push({
        x,
        y,
        dir: this.selectedDir,
        color: this.selectedColor
      });
    } else if (this.activeTool === 'receptor') {
      this.customLevel.receptors.push({
        x,
        y,
        color: this.selectedColor
      });
    } else if (this.activeTool === 'blocker') {
      this.customLevel.fixedItems.push({
        type: 'blocker',
        x,
        y
      });
    } else if (this.activeTool === 'mirror' || this.activeTool === 'splitter') {
      this.customLevel.fixedItems.push({
        type: this.activeTool,
        x,
        y,
        angle: this.selectedAngle
      });
    } else if (this.activeTool === 'filter') {
      this.customLevel.fixedItems.push({
        type: 'filter',
        x,
        y,
        angle: this.selectedAngle,
        filterColor: this.selectedColor
      });
    }
  }

  exportLevelCode() {
    return btoa(JSON.stringify(this.customLevel));
  }

  importLevelCode(codeStr) {
    try {
      const parsed = JSON.parse(atob(codeStr.trim()));
      if (parsed.cols && parsed.rows) {
        this.customLevel = parsed;
        this.cols = parsed.cols;
        this.rows = parsed.rows;
        return true;
      }
    } catch (e) {
      console.warn('Failed to parse level code:', e);
    }
    return false;
  }

  saveLevel() {
    storage.saveCustomLevel(this.customLevel);
  }
}
