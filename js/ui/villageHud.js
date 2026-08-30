/**
 * Village HUD Controller - Resources, Shop, Army Training, and Building Inspector
 */

import { BUILDINGS_DATA } from '../village/buildingData.js';
import { TROOPS_DATA } from '../combat/troopAI.js';
import { DialogManager } from './dialogManager.js';
import { soundManager } from '../audio/soundManager.js';

export class VillageHUD {
  constructor(baseManager, onStartRaidCallback, onSelectBuildCallback) {
    this.baseManager = baseManager;
    this.onStartRaid = onStartRaidCallback;
    this.onSelectBuild = onSelectBuildCallback;
    this.selectedBuilding = null;

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-open-shop')?.addEventListener('click', () => {
      soundManager.playClick();
      this.renderShop();
      DialogManager.open('shop-dialog');
    });

    document.getElementById('btn-open-train')?.addEventListener('click', () => {
      soundManager.playClick();
      this.renderTrainingModal();
      DialogManager.open('train-dialog');
    });

    document.getElementById('btn-start-attack')?.addEventListener('click', () => {
      soundManager.playClick();
      this.onStartRaid();
    });

    document.getElementById('btn-close-inspector')?.addEventListener('click', () => {
      this.deselectBuilding();
    });
  }

  updateHUD() {
    const res = this.baseManager.resources;
    const maxGold = this.baseManager.getMaxGoldCapacity();
    const maxElixir = this.baseManager.getMaxElixirCapacity();
    const curArmy = this.baseManager.getCurrentArmyHousing();
    const maxArmy = this.baseManager.getMaxArmyHousing();

    // Resources
    const goldEl = document.getElementById('hud-gold');
    const elixirEl = document.getElementById('hud-elixir');
    const gemsEl = document.getElementById('hud-gems');
    const armyEl = document.getElementById('hud-army-count');

    if (goldEl) goldEl.textContent = `${Math.floor(res.gold).toLocaleString()} / ${maxGold.toLocaleString()}`;
    if (elixirEl) elixirEl.textContent = `${Math.floor(res.elixir).toLocaleString()} / ${maxElixir.toLocaleString()}`;
    if (gemsEl) gemsEl.textContent = res.gems || 50;
    if (armyEl) armyEl.textContent = `${curArmy} / ${maxArmy}`;
  }

  selectBuilding(building) {
    this.selectedBuilding = building;
    const inspector = document.getElementById('building-inspector');
    if (!inspector) return;

    inspector.style.display = 'flex';
    document.getElementById('inspector-title').textContent = `${building.name} (Lvl ${building.level || 1})`;
    document.getElementById('inspector-desc').textContent = building.description || '';
    document.getElementById('inspector-hp').textContent = `HP: ${building.hp} / ${building.maxHp}`;
  }

  deselectBuilding() {
    this.selectedBuilding = null;
    const inspector = document.getElementById('building-inspector');
    if (inspector) inspector.style.display = 'none';
  }

  renderShop() {
    const container = document.getElementById('shop-items-grid');
    if (!container) return;

    container.innerHTML = '';
    const res = this.baseManager.resources;

    for (const key in BUILDINGS_DATA) {
      if (key === 'town_hall') continue; // Only 1 Town Hall
      const b = BUILDINGS_DATA[key];

      const card = document.createElement('div');
      card.className = 'shop-card';
      const costType = b.baseCost.gold ? 'Gold' : 'Elixir';
      const costVal = b.baseCost.gold || b.baseCost.elixir || 0;
      const canAfford = (b.baseCost.gold && res.gold >= b.baseCost.gold) || (b.baseCost.elixir && res.elixir >= b.baseCost.elixir);

      card.innerHTML = `
        <div class="shop-card-icon" style="background: ${b.color};">${b.name[0]}</div>
        <div class="shop-card-info">
          <h4>${b.name}</h4>
          <p>${b.description}</p>
          <div class="shop-price ${canAfford ? 'affordable' : 'expensive'}">
            ${costType === 'Gold' ? '💰' : '🧪'} ${costVal.toLocaleString()} ${costType}
          </div>
        </div>
      `;

      if (canAfford) {
        card.addEventListener('click', () => {
          DialogManager.close('shop-dialog');
          this.onSelectBuild(key);
        });
      } else {
        card.classList.add('disabled');
      }

      container.appendChild(card);
    }
  }

  renderTrainingModal() {
    const container = document.getElementById('train-troops-grid');
    if (!container) return;

    container.innerHTML = '';
    const army = this.baseManager.army;
    const queue = this.baseManager.trainingQueue;

    for (const key in TROOPS_DATA) {
      const t = TROOPS_DATA[key];
      const count = army[key] || 0;
      const queueCount = queue.filter(q => q.type === key).length;

      const card = document.createElement('div');
      card.className = 'train-card';

      card.innerHTML = `
        <div class="train-icon">${t.icon}</div>
        <div class="train-info">
          <h4>${t.name} (x${count})</h4>
          <div class="train-stats">HP: ${t.hp} | DMG: ${t.damage} | Space: ${t.housingSpace}</div>
          <div class="train-cost">🧪 ${t.trainingCost.elixir} Elixir (${t.trainingTime}s)</div>
          ${queueCount > 0 ? `<div class="train-queued">Queued: +${queueCount}</div>` : ''}
        </div>
        <button class="btn-primary btn-train">Train</button>
      `;

      card.querySelector('.btn-train').addEventListener('click', () => {
        const res = this.baseManager.queueTroopTraining(key);
        if (res.success) {
          soundManager.playClick();
          this.renderTrainingModal();
          this.updateHUD();
        } else {
          DialogManager.showToast(res.reason, 'error');
        }
      });

      container.appendChild(card);
    }
  }
}
