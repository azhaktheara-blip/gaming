/**
 * SYNAPSE: The Neuro-Logic Matrix - Main Application Orchestrator
 */
import { Renderer } from './engine/renderer.js';
import { InputManager } from './engine/input.js';
import { storage } from './engine/storage.js';
import { soundManager } from './audio/soundManager.js';
import { HUD } from './ui/hud.js';
import { DialogManager } from './ui/dialogManager.js';
import { LevelSelectModal } from './ui/levelSelectModal.js';

import { OpticsEngine } from './puzzles/opticsEngine.js';
import { OPTICS_LEVELS, generateProceduralOpticsLevel } from './puzzles/opticsLevels.js';

import { ChronoEngine } from './puzzles/chronoEngine.js';
import { CHRONO_LEVELS, generateProceduralChronoLevel } from './puzzles/chronoLevels.js';

import { CipherEngine } from './puzzles/cipherEngine.js';
import { CIPHER_LEVELS, generateProceduralCipherLevel } from './puzzles/cipherLevels.js';

import { DailyGauntlet } from './puzzles/dailyGauntlet.js';
import { LevelEditor } from './editor/levelEditor.js';

class GameApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    
    this.currentMode = 'optics'; // optics | chrono | cipher | daily | editor
    this.currentLevelIndex = 0;
    this.activeEngine = null;
    this.selectedDockItem = null;
    this.hoverCell = { x: -1, y: -1 };
    this.isVictoryTransitioning = false;

    // Daily Gauntlet State
    this.dailyStages = [];
    this.currentDailyStageIdx = 0;
    this.dailyTotalTime = 0;
    this.dailyTotalMoves = 0;
    this.dailyHintsUsed = 0;

    // Level Editor
    this.levelEditor = new LevelEditor(this.testCustomLevel.bind(this));

    // UI Modules
    this.hud = new HUD({
      onModeChange: this.switchMode.bind(this),
      onUndo: this.handleUndo.bind(this),
      onReset: this.handleReset.bind(this),
      onHint: this.handleHint.bind(this),
      onLoop: this.handleLoopAction.bind(this),
      onOpenLevels: this.openLevelSelect.bind(this),
      onOpenEditor: () => this.switchMode('editor')
    });

    this.levelSelectModal = new LevelSelectModal(this.loadLevelById.bind(this));
    this.input = new InputManager(this.canvas, this.handleInput.bind(this));

    this.lastTime = performance.now();
    this.init();
  }

  init() {
    this.renderer.resize();
    this.loadLevel('optics', 0);
    this.bindGlobalDialogButtons();
    
    requestAnimationFrame(this.gameLoop.bind(this));

    // First user gesture will unlock audio
    const unlockAudio = () => {
      soundManager.init();
      if (!soundManager.isMusicMuted && !soundManager.isMuted) {
        soundManager.startMusic();
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    setTimeout(() => {
      DialogManager.showToast('SYNAPSE Core Initialized. Ready for deduction.');
    }, 400);
  }

  bindGlobalDialogButtons() {
    document.getElementById('btn-next-level')?.addEventListener('click', () => {
      DialogManager.close('victory-dialog');
      this.loadNextLevel();
    });

    document.getElementById('btn-replay-level')?.addEventListener('click', () => {
      DialogManager.close('victory-dialog');
      this.handleReset();
    });

    document.getElementById('btn-export-code')?.addEventListener('click', () => {
      const code = this.levelEditor.exportLevelCode();
      navigator.clipboard?.writeText(code);
      DialogManager.showToast('Level code copied to clipboard!');
    });

    document.getElementById('btn-import-code')?.addEventListener('click', () => {
      const input = prompt('Paste level code:');
      if (input && this.levelEditor.importLevelCode(input)) {
        DialogManager.showToast('Level loaded into Studio!');
      } else if (input) {
        alert('Invalid level code format.');
      }
    });

    document.getElementById('btn-test-editor-level')?.addEventListener('click', () => {
      this.testCustomLevel(this.levelEditor.customLevel);
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.currentLevelIndex = 0;
    this.hud.setActiveModeTab(mode);
    soundManager.playClick();

    if (mode === 'daily') {
      this.startDailyGauntlet();
    } else if (mode === 'editor') {
      DialogManager.open('editor-dialog');
    } else {
      this.loadLevel(mode, 0);
    }
  }

  loadLevel(mode, index) {
    this.currentMode = mode;
    this.currentLevelIndex = index;
    this.isVictoryTransitioning = false;

    let levelData;
    if (mode === 'chrono') {
      levelData = CHRONO_LEVELS[index] || generateProceduralChronoLevel(Date.now() + index);
      this.activeEngine = new ChronoEngine(levelData);
      document.getElementById('btn-rewind-loop').style.display = 'inline-flex';
    } else if (mode === 'cipher') {
      levelData = CIPHER_LEVELS[index] || generateProceduralCipherLevel(Date.now() + index);
      this.activeEngine = new CipherEngine(levelData);
      document.getElementById('btn-rewind-loop').style.display = 'none';
    } else {
      levelData = OPTICS_LEVELS[index] || generateProceduralOpticsLevel(Date.now() + index);
      this.activeEngine = new OpticsEngine(levelData);
      document.getElementById('btn-rewind-loop').style.display = 'none';
    }

    this.hud.startTimer();
    this.updateHUDDisplay();
  }

  loadLevelById(mode, levelId) {
    DialogManager.close('level-select-dialog');
    const levels = mode === 'chrono' ? CHRONO_LEVELS : mode === 'cipher' ? CIPHER_LEVELS : OPTICS_LEVELS;
    const idx = levels.findIndex(l => l.id === levelId);
    this.loadLevel(mode, idx >= 0 ? idx : 0);
  }

  startDailyGauntlet() {
    this.dailyStages = DailyGauntlet.getDailyChallenges();
    this.currentDailyStageIdx = 0;
    this.dailyTotalTime = 0;
    this.dailyTotalMoves = 0;
    this.dailyHintsUsed = 0;

    this.loadDailyStage(0);
    DialogManager.showToast('Daily Cognitive Gauntlet: Stage 1/3 Commenced');
  }

  loadDailyStage(stageIdx) {
    const stage = this.dailyStages[stageIdx];
    this.currentMode = stage.mode;
    
    if (stage.mode === 'optics') {
      this.activeEngine = new OpticsEngine(stage.levelData);
      document.getElementById('btn-rewind-loop').style.display = 'none';
    } else if (stage.mode === 'chrono') {
      this.activeEngine = new ChronoEngine(stage.levelData);
      document.getElementById('btn-rewind-loop').style.display = 'inline-flex';
    } else {
      this.activeEngine = new CipherEngine(stage.levelData);
      document.getElementById('btn-rewind-loop').style.display = 'none';
    }

    this.hud.startTimer();
    this.updateHUDDisplay();
  }

  testCustomLevel(levelData) {
    DialogManager.close('editor-dialog');
    this.activeEngine = new OpticsEngine(levelData);
    this.hud.startTimer();
    this.updateHUDDisplay();
    DialogManager.showToast('Testing custom puzzle matrix.');
  }

  updateHUDDisplay() {
    if (!this.activeEngine) return;

    const moves = this.activeEngine.moves ?? this.activeEngine.totalMoves ?? 0;
    const target = this.activeEngine.targetMoves || 10;
    const title = this.activeEngine.title || 'Matrix';
    const lvlNum = this.currentLevelIndex + 1;

    this.hud.updateLevelInfo(lvlNum, title, moves, target);

    if (this.currentMode === 'optics') {
      this.hud.renderInventory(this.activeEngine.inventory, (type, color) => {
        this.selectedDockItem = { type, color };
        soundManager.playClick();
        DialogManager.showToast(`Selected ${type.toUpperCase()}`);
      });
    } else {
      this.hud.renderInventory([], () => {});
    }
  }

  handleInput(event) {
    if (!this.activeEngine) return;

    if (event.type === 'MOVE' && this.currentMode === 'chrono') {
      const moved = this.activeEngine.movePlayer(event.dx, event.dy);
      if (moved) {
        soundManager.playStep();
        this.updateHUDDisplay();
        this.checkWinCondition();
      }
    } else if (event.type === 'LOOP_ACTION') {
      this.handleLoopAction();
    } else if (event.type === 'UNDO') {
      this.handleUndo();
    } else if (event.type === 'HINT') {
      this.handleHint();
    } else if (event.type === 'POINTER_MOVE') {
      const { gx, gy } = this.getGridCoords(event.x, event.y);
      this.hoverCell = { x: gx, y: gy };
    } else if (event.type === 'POINTER_DOWN') {
      this.handleCanvasPointerDown(event.x, event.y);
    } else if (event.type === 'ROTATE_ACTION' || event.type === 'ROTATE_SELECTED') {
      this.handleRotateAtPointer(event.x, event.y);
    }
  }

  getGridCoords(pixelX, pixelY) {
    const cols = this.activeEngine?.cols || 8;
    const rows = this.activeEngine?.rows || 8;
    const size = Math.min(this.renderer.width, this.renderer.height);
    const cellSize = (size - 40) / Math.max(cols, rows);
    const offsetX = (this.renderer.width - cols * cellSize) / 2;
    const offsetY = (this.renderer.height - rows * cellSize) / 2;

    const gx = Math.floor((pixelX - offsetX) / cellSize);
    const gy = Math.floor((pixelY - offsetY) / cellSize);

    return { gx, gy, cellSize, offsetX, offsetY };
  }

  handleCanvasPointerDown(px, py) {
    if (this.currentMode === 'optics') {
      const { gx, gy } = this.getGridCoords(px, py);
      
      // If we have an item selected from inventory dock
      if (this.selectedDockItem) {
        const placed = this.activeEngine.placeItem(this.selectedDockItem.type, gx, gy, 45, this.selectedDockItem.color);
        if (placed) {
          soundManager.playRotate();
          this.renderer.addParticle(px, py, '#00f0ff', 12, 60, 0.4);
          this.selectedDockItem = null;
          this.updateHUDDisplay();
          this.checkWinCondition();
        }
      } else {
        // Tap placed piece to rotate it
        const rotated = this.activeEngine.rotateItem(gx, gy);
        if (rotated) {
          soundManager.playRotate();
          this.renderer.addParticle(px, py, '#00f0ff', 8, 40, 0.3);
          this.updateHUDDisplay();
          this.checkWinCondition();
        }
      }
    } else if (this.currentMode === 'cipher') {
      const inputs = this.activeEngine.inputs || [];
      const numInputs = inputs.length;
      
      for (let i = 0; i < numInputs; i++) {
        const sy = (this.renderer.height / (numInputs + 1)) * (i + 1);
        const sx = this.renderer.width * 0.15;
        const dist = Math.hypot(px - sx, py - sy);

        if (dist <= 28) {
          this.activeEngine.toggleInput(inputs[i].id);
          soundManager.playSwitch();
          this.renderer.addParticle(sx, sy, '#00ff66', 15, 70, 0.4);
          this.updateHUDDisplay();
          this.checkWinCondition();
          break;
        }
      }
    }
  }

  handleRotateAtPointer(px, py) {
    if (this.currentMode === 'optics') {
      const { gx, gy } = this.getGridCoords(px || this.renderer.width / 2, py || this.renderer.height / 2);
      if (this.activeEngine.rotateItem(gx, gy)) {
        soundManager.playRotate();
        this.updateHUDDisplay();
        this.checkWinCondition();
      }
    }
  }

  handleLoopAction() {
    if (this.currentMode === 'chrono' && this.activeEngine) {
      const success = this.activeEngine.triggerParadoxLoop();
      soundManager.playRewind();
      this.renderer.triggerShake(5);
      
      this.canvas.classList.add('rewind-active');
      setTimeout(() => this.canvas.classList.remove('rewind-active'), 800);
      
      DialogManager.showToast(`Loop ${this.activeEngine.currentTimelineIndex + 1}: Ghost clone synchronized.`);
      this.updateHUDDisplay();
    }
  }

  handleUndo() {
    if (this.activeEngine?.undo) {
      if (this.activeEngine.undo()) {
        soundManager.playClick();
        this.updateHUDDisplay();
      }
    }
  }

  handleReset() {
    if (this.activeEngine?.resetAll) {
      this.activeEngine.resetAll();
    } else if (this.activeEngine?.init) {
      this.loadLevel(this.currentMode, this.currentLevelIndex);
    }
    soundManager.playClick();
    this.updateHUDDisplay();
  }

  handleHint() {
    if (!this.activeEngine) return;
    this.dailyHintsUsed++;
    const hints = this.activeEngine.hints || ['Think carefully about the routing geometry.'];
    const hintBody = document.getElementById('hint-dialog-body');
    if (hintBody) {
      hintBody.innerHTML = hints.map((h, i) => `<p style="margin-bottom: 8px;"><strong>Clue ${i + 1}:</strong> ${h}</p>`).join('');
    }
    DialogManager.open('hint-dialog');
  }

  openLevelSelect() {
    this.levelSelectModal.render(this.currentMode);
    DialogManager.open('level-select-dialog');
  }

  checkWinCondition() {
    if (this.activeEngine?.isSolved && !this.isVictoryTransitioning) {
      this.isVictoryTransitioning = true;
      this.hud.stopTimer();
      soundManager.playVictory();
      this.renderer.triggerShake(8);
      
      // Spawn supernova confetti particles
      this.renderer.addParticle(this.renderer.width / 2, this.renderer.height / 2, '#00f0ff', 70, 220, 1.4);
      this.renderer.addParticle(this.renderer.width / 2, this.renderer.height / 2, '#ff007f', 50, 180, 1.4);
      this.renderer.addParticle(this.renderer.width / 2, this.renderer.height / 2, '#ffea00', 50, 180, 1.4);

      const stars = this.activeEngine.getStarRating();
      const moves = this.activeEngine.moves ?? this.activeEngine.totalMoves ?? 0;
      const time = this.hud.elapsedSeconds;

      storage.saveLevelProgress(this.currentMode, this.currentLevelIndex + 1, { stars, moves, time });

      if (this.currentMode === 'daily' || this.dailyStages.length > 0) {
        this.dailyTotalTime += time;
        this.dailyTotalMoves += moves;
        this.currentDailyStageIdx++;

        if (this.currentDailyStageIdx < this.dailyStages.length) {
          setTimeout(() => {
            this.loadDailyStage(this.currentDailyStageIdx);
          }, 1200);
          return;
        } else {
          const cqScore = DailyGauntlet.calculateCQ(this.dailyTotalTime, this.dailyTotalMoves, this.dailyHintsUsed);
          storage.saveDailyRecord(DailyGauntlet.getTodayDateString(), cqScore, {
            time: this.dailyTotalTime,
            moves: this.dailyTotalMoves
          });
          this.showVictoryModal(stars, moves, time, `Daily Gauntlet Complete! CQ Score: ${cqScore}`);
          return;
        }
      }

      setTimeout(() => {
        this.showVictoryModal(stars, moves, time);
      }, 700);
    }
  }

  showVictoryModal(stars, moves, time, customTitle = 'SYNAPSE OVERLOAD RESOLVED') {
    const starsEl = document.getElementById('victory-stars-display');
    const titleEl = document.getElementById('victory-title');
    const movesEl = document.getElementById('victory-moves');
    const timeEl = document.getElementById('victory-time');
    const totalStarsEl = document.getElementById('victory-total-stars');

    if (starsEl) starsEl.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    if (titleEl) titleEl.textContent = customTitle;
    if (movesEl) movesEl.textContent = moves;
    if (timeEl) timeEl.textContent = `${time}s`;
    if (totalStarsEl) totalStarsEl.textContent = storage.getTotalStars();

    DialogManager.open('victory-dialog');
  }

  loadNextLevel() {
    this.loadLevel(this.currentMode, this.currentLevelIndex + 1);
  }

  // --- MAIN RENDER LOOP ---
  gameLoop(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.renderer.clear();
    this.renderer.update(dt);

    if (this.activeEngine) {
      if (this.currentMode === 'optics') {
        this.renderOpticsMode();
      } else if (this.currentMode === 'chrono') {
        this.renderChronoMode();
      } else if (this.currentMode === 'cipher') {
        this.renderCipherMode();
      }
    }

    this.renderer.drawParticles();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  renderOpticsMode() {
    const cols = this.activeEngine.cols;
    const rows = this.activeEngine.rows;
    const size = Math.min(this.renderer.width, this.renderer.height);
    const cellSize = (size - 40) / Math.max(cols, rows);
    const offsetX = (this.renderer.width - cols * cellSize) / 2;
    const offsetY = (this.renderer.height - rows * cellSize) / 2;

    this.renderer.drawGrid(cellSize, cols, rows, offsetX, offsetY, this.hoverCell);

    // Draw Laser Rays
    for (const ray of this.activeEngine.rays) {
      const sx = offsetX + (ray.startX + 0.5) * cellSize;
      const sy = offsetY + (ray.startY + 0.5) * cellSize;
      const ex = offsetX + (ray.endX + 0.5) * cellSize;
      const ey = offsetY + (ray.endY + 0.5) * cellSize;
      this.renderer.drawLaser(sx, sy, ex, ey, ray.color);
    }

    // Draw Receptors
    for (const r of this.activeEngine.receptors) {
      const rx = offsetX + (r.x + 0.5) * cellSize;
      const ry = offsetY + (r.y + 0.5) * cellSize;
      this.renderer.drawReceptor(rx, ry, cellSize, r.color, r.powered);
    }

    // Draw Emitters
    for (const e of this.activeEngine.emitters) {
      const ex = offsetX + (e.x + 0.5) * cellSize;
      const ey = offsetY + (e.y + 0.5) * cellSize;
      this.renderer.drawEmitter(ex, ey, cellSize, e.dir, e.color);
    }

    // Draw Grid Elements (Mirrors, Splitters, Filters, Portals, Blockers)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const item = this.activeEngine.grid[r][c];
        if (!item) continue;

        const ix = offsetX + (c + 0.5) * cellSize;
        const iy = offsetY + (r + 0.5) * cellSize;

        if (item.type === 'mirror') {
          this.renderer.drawMirror(ix, iy, cellSize, item.angle || 45);
        } else if (item.type === 'splitter') {
          this.renderer.drawSplitter(ix, iy, cellSize, item.angle || 45);
        } else if (item.type === 'filter') {
          this.renderer.drawFilter(ix, iy, cellSize, item.angle || 45, item.filterColor || 'cyan');
        } else if (item.type === 'portal') {
          this.renderer.drawPortal(ix, iy, cellSize, item.portalId || 1);
        } else if (item.type === 'blocker') {
          this.renderer.drawBlocker(ix, iy, cellSize);
        }
      }
    }
  }

  renderChronoMode() {
    const cols = this.activeEngine.cols;
    const rows = this.activeEngine.rows;
    const size = Math.min(this.renderer.width, this.renderer.height);
    const cellSize = (size - 40) / Math.max(cols, rows);
    const offsetX = (this.renderer.width - cols * cellSize) / 2;
    const offsetY = (this.renderer.height - rows * cellSize) / 2;

    this.renderer.drawGrid(cellSize, cols, rows, offsetX, offsetY, this.hoverCell);

    for (const w of this.activeEngine.walls) {
      const wx = offsetX + (w.x + 0.5) * cellSize;
      const wy = offsetY + (w.y + 0.5) * cellSize;
      this.renderer.drawBlocker(wx, wy, cellSize);
    }

    for (const p of this.activeEngine.plates) {
      const px = offsetX + (p.x + 0.5) * cellSize;
      const py = offsetY + (p.y + 0.5) * cellSize;
      this.renderer.drawPressurePlate(px, py, cellSize, p.isPressed);
    }

    for (const d of this.activeEngine.doors) {
      const dx = offsetX + (d.x + 0.5) * cellSize;
      const dy = offsetY + (d.y + 0.5) * cellSize;
      this.renderer.drawDoor(dx, dy, cellSize, d.isOpen);
    }

    const ex = offsetX + (this.activeEngine.exitPortal.x + 0.5) * cellSize;
    const ey = offsetY + (this.activeEngine.exitPortal.y + 0.5) * cellSize;
    this.renderer.drawExitPortal(ex, ey, cellSize, true);

    for (const b of this.activeEngine.batteries) {
      const bx = offsetX + (b.x + 0.5) * cellSize;
      const by = offsetY + (b.y + 0.5) * cellSize;
      this.renderer.drawBattery(bx, by, cellSize);
    }

    const ghosts = this.activeEngine.getGhostPositions();
    for (const g of ghosts) {
      const gx = offsetX + (g.x + 0.5) * cellSize;
      const gy = offsetY + (g.y + 0.5) * cellSize;
      this.renderer.drawPlayer(gx, gy, cellSize, true, g.index);
    }

    const plx = offsetX + (this.activeEngine.player.x + 0.5) * cellSize;
    const ply = offsetY + (this.activeEngine.player.y + 0.5) * cellSize;
    this.renderer.drawPlayer(plx, ply, cellSize, false);
  }

  renderCipherMode() {
    const ctx = this.renderer.ctx;
    const inputs = this.activeEngine.inputs || [];
    const gates = this.activeEngine.gates || [];
    const outputs = this.activeEngine.outputs || [];

    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(15, 15, this.renderer.width - 30, this.renderer.height - 30);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, this.renderer.width - 30, this.renderer.height - 30);

    // Draw Input Switches
    inputs.forEach((input, idx) => {
      const y = (this.renderer.height / (inputs.length + 1)) * (idx + 1);
      const x = this.renderer.width * 0.15;

      ctx.fillStyle = input.value === 1 ? '#00ff66' : '#1a2236';
      ctx.strokeStyle = input.value === 1 ? '#00ff66' : '#3d4d73';
      ctx.lineWidth = 2.5;
      if (input.value === 1) {
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 14;
      }
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = input.value === 1 ? '#000000' : '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${input.id}: ${input.value}`, x, y);
    });

    // Draw Gates
    gates.forEach(gate => {
      const gx = this.renderer.width * gate.x;
      const gy = this.renderer.height * gate.y;
      this.renderer.drawLogicGate(gx, gy, 65, gate.type, gate.outputValue === 1);
    });

    // Draw Target Outputs
    outputs.forEach((out, idx) => {
      const y = (this.renderer.height / (outputs.length + 1)) * (idx + 1);
      const x = this.renderer.width * 0.85;

      ctx.fillStyle = out.isSatisfied ? 'rgba(0, 255, 102, 0.3)' : '#1e2436';
      ctx.strokeStyle = out.isSatisfied ? '#00ff66' : '#ff0055';
      ctx.lineWidth = 2.5;
      ctx.fillRect(x - 35, y - 22, 70, 44);
      ctx.strokeRect(x - 35, y - 22, 70, 44);

      ctx.fillStyle = out.isSatisfied ? '#00ff66' : '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${out.id}: Target ${out.target}`, x, y - 5);
      ctx.fillText(`(Cur: ${out.currentValue ?? 0})`, x, y + 12);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
