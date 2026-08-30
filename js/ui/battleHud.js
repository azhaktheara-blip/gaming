/**
 * Battle HUD Controller - Deployment Deck, Destruction Meter, Clock, and Raid Summary Report
 */

import { TROOPS_DATA } from '../combat/troopAI.js';
import { DialogManager } from './dialogManager.js';
import { soundManager } from '../audio/soundManager.js';

export class BattleHUD {
  constructor(onEndBattleCallback) {
    this.onEndBattle = onEndBattleCallback;
    this.selectedTroopType = null;
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-surrender')?.addEventListener('click', () => {
      soundManager.playClick();
      this.onEndBattle();
    });

    document.getElementById('btn-return-village')?.addEventListener('click', () => {
      DialogManager.close('battle-report-dialog');
      this.onEndBattle();
    });
  }

  renderDeck(battleManager) {
    const container = document.getElementById('battle-troop-deck');
    if (!container) return;

    container.innerHTML = '';
    const deck = battleManager.armyDeck;

    for (const type in deck) {
      const count = deck[type];
      const data = TROOPS_DATA[type];
      if (!data) continue;

      const card = document.createElement('div');
      card.className = `deck-card ${this.selectedTroopType === type ? 'active' : ''} ${count <= 0 ? 'empty' : ''}`;

      card.innerHTML = `
        <div class="deck-icon">${data.icon}</div>
        <div class="deck-count">${count}</div>
      `;

      if (count > 0) {
        card.addEventListener('click', () => {
          soundManager.playClick();
          this.selectedTroopType = type;
          this.renderDeck(battleManager);
        });
      }

      container.appendChild(card);
    }

    if (!this.selectedTroopType || deck[this.selectedTroopType] <= 0) {
      this.selectedTroopType = Object.keys(deck).find(t => deck[t] > 0) || null;
    }
  }

  updateBattleHUD(battleManager) {
    // Timer
    const mins = String(Math.floor(battleManager.battleTimer / 60)).padStart(2, '0');
    const secs = String(Math.floor(battleManager.battleTimer % 60)).padStart(2, '0');
    const timerEl = document.getElementById('battle-timer');
    if (timerEl) timerEl.textContent = `${mins}:${secs}`;

    // Destruction %
    const destEl = document.getElementById('battle-destruction-val');
    const progressEl = document.getElementById('battle-destruction-bar');
    if (destEl) destEl.textContent = `${battleManager.destructionPercent}%`;
    if (progressEl) progressEl.style.width = `${battleManager.destructionPercent}%`;

    // Stars
    const starsEl = document.getElementById('battle-stars');
    if (starsEl) {
      starsEl.textContent = '★'.repeat(battleManager.stars) + '☆'.repeat(3 - battleManager.stars);
    }

    // Stolen Loot
    const goldLootEl = document.getElementById('battle-stolen-gold');
    const elixirLootEl = document.getElementById('battle-stolen-elixir');
    if (goldLootEl) goldLootEl.textContent = `+${battleManager.stolenLoot.gold.toLocaleString()}`;
    if (elixirLootEl) elixirLootEl.textContent = `+${battleManager.stolenLoot.elixir.toLocaleString()}`;
  }

  showBattleReport(battleManager) {
    const isWin = battleManager.stars > 0;
    const titleEl = document.getElementById('report-title');
    const starsEl = document.getElementById('report-stars');
    const destEl = document.getElementById('report-destruction');
    const goldEl = document.getElementById('report-gold');
    const elixirEl = document.getElementById('report-elixir');

    if (titleEl) {
      titleEl.textContent = isWin ? 'VICTORY RAID!' : 'DEFEAT';
      titleEl.style.color = isWin ? '#22c55e' : '#ef4444';
    }

    if (starsEl) starsEl.textContent = '★'.repeat(battleManager.stars) + '☆'.repeat(3 - battleManager.stars);
    if (destEl) destEl.textContent = `${battleManager.destructionPercent}% Destruction`;
    if (goldEl) goldEl.textContent = `💰 +${battleManager.stolenLoot.gold.toLocaleString()}`;
    if (elixirEl) elixirEl.textContent = `🧪 +${battleManager.stolenLoot.elixir.toLocaleString()}`;

    DialogManager.open('battle-report-dialog');
  }
}
