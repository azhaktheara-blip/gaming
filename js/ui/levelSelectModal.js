/**
 * Level Selection Modal Controller
 */
import { storage } from '../engine/storage.js';
import { OPTICS_LEVELS } from '../puzzles/opticsLevels.js';
import { CHRONO_LEVELS } from '../puzzles/chronoLevels.js';
import { CIPHER_LEVELS } from '../puzzles/cipherLevels.js';

export class LevelSelectModal {
  constructor(onSelectLevelCallback) {
    this.onSelectLevel = onSelectLevelCallback;
    this.currentMode = 'optics';
  }

  render(mode = 'optics') {
    this.currentMode = mode;
    const container = document.getElementById('level-grid-container');
    if (!container) return;

    container.innerHTML = '';
    const levels = mode === 'chrono' ? CHRONO_LEVELS : mode === 'cipher' ? CIPHER_LEVELS : OPTICS_LEVELS;
    const progress = storage.getAllModeProgress(mode);

    levels.forEach((lvl, index) => {
      const lvlProgress = progress[lvl.id] || { completed: false, stars: 0 };
      const isLocked = index > 0 && !progress[levels[index - 1].id]?.completed;

      const card = document.createElement('div');
      card.className = `level-card ${lvlProgress.completed ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
      
      const starsStr = '★'.repeat(lvlProgress.stars || 0) + '☆'.repeat(3 - (lvlProgress.stars || 0));

      card.innerHTML = `
        <div class="level-num">${lvl.id}</div>
        <div class="level-stars">${lvlProgress.completed ? starsStr : (isLocked ? '🔒' : 'PLAY')}</div>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          this.onSelectLevel(mode, lvl.id);
        });
      }

      container.appendChild(card);
    });
  }
}
