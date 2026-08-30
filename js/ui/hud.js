/**
 * HUD & Floating UI Controller
 */
import { soundManager } from '../audio/soundManager.js';
import { DialogManager } from './dialogManager.js';

export class HUD {
  constructor(handlers) {
    this.handlers = handlers; // { onModeChange, onUndo, onReset, onHint, onLoop, onOpenLevels, onOpenEditor }
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.bindButtons();
  }

  bindButtons() {
    // Mode Switcher Tabs
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = btn.dataset.mode;
        this.setActiveModeTab(mode);
        this.handlers.onModeChange(mode);
      });
    });

    // Top action buttons
    document.getElementById('btn-sound')?.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      this.updateSoundButton(isMuted);
    });

    document.getElementById('btn-level-select')?.addEventListener('click', () => {
      this.handlers.onOpenLevels();
    });

    document.getElementById('btn-editor')?.addEventListener('click', () => {
      this.handlers.onOpenEditor();
    });

    // Floating in-game buttons
    document.getElementById('btn-undo')?.addEventListener('click', () => {
      this.handlers.onUndo();
    });

    document.getElementById('btn-reset')?.addEventListener('click', () => {
      this.handlers.onReset();
    });

    document.getElementById('btn-hint')?.addEventListener('click', () => {
      this.handlers.onHint();
    });

    document.getElementById('btn-rewind-loop')?.addEventListener('click', () => {
      this.handlers.onLoop();
    });
  }

  setActiveModeTab(mode) {
    document.querySelectorAll('.mode-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  }

  updateSoundButton(isMuted) {
    const btn = document.getElementById('btn-sound');
    if (btn) {
      btn.innerHTML = isMuted ? '🔇' : '🔊';
    }
  }

  startTimer() {
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const el = document.getElementById('hud-timer');
    if (el) {
      const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
      el.textContent = `${mins}:${secs}`;
    }
  }

  updateLevelInfo(levelNum, title, moves, targetMoves) {
    const badge = document.getElementById('hud-level-badge');
    const titleEl = document.getElementById('hud-level-title');
    const movesEl = document.getElementById('hud-moves');

    if (badge) badge.textContent = `LVL ${levelNum}`;
    if (titleEl) titleEl.textContent = title;
    if (movesEl) movesEl.textContent = `${moves} / ${targetMoves}`;
  }

  renderInventory(inventory, onSelectType) {
    const dock = document.getElementById('inventory-dock');
    if (!dock) return;

    dock.innerHTML = '';
    if (!inventory || inventory.length === 0) {
      dock.style.display = 'none';
      return;
    }

    dock.style.display = 'flex';
    inventory.forEach(item => {
      if (item.count <= 0) return;

      const el = document.createElement('div');
      el.className = 'dock-item';
      
      const icon = item.type === 'mirror' ? '🪞' : item.type === 'splitter' ? '💠' : item.type === 'filter' ? '🟦' : '⚙️';
      
      el.innerHTML = `
        <div class="item-icon">${icon}</div>
        <div class="item-count">${item.count}</div>
      `;

      el.addEventListener('click', () => {
        onSelectType(item.type, item.filterColor);
      });

      dock.appendChild(el);
    });
  }
}
