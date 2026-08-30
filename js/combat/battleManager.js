/**
 * Battle Manager - Orchestrates live combat raids, troop deployment, destruction tracking, and loot stealing.
 */

import { Troop, TROOPS_DATA } from './troopAI.js';
import { DefensiveTower } from './towerAI.js';
import { ProjectileEngine } from './projectileEngine.js';
import { PathfindingEngine } from '../engine/pathfinding.js';
import { BUILDINGS_DATA, BUILDING_TYPES } from '../village/buildingData.js';

export class BattleManager {
  constructor(enemyBaseData, playerArmy, renderer) {
    this.renderer = renderer;
    this.gridSize = enemyBaseData.gridSize || 34;
    this.baseName = enemyBaseData.name || 'Enemy Stronghold';
    this.availableLoot = JSON.parse(JSON.stringify(enemyBaseData.loot || { gold: 5000, elixir: 5000 }));
    this.initialLoot = JSON.parse(JSON.stringify(this.availableLoot));
    this.stolenLoot = { gold: 0, elixir: 0 };

    // Clone enemy structures
    this.buildings = enemyBaseData.buildings.map(b => {
      const template = BUILDINGS_DATA[b.type] || {};
      return {
        ...template,
        ...b,
        width: b.width || template.width || 2,
        height: b.height || template.height || 2,
        hp: b.hp || template.hp || 500,
        maxHp: b.maxHp || b.hp || template.hp || 500
      };
    });

    this.walls = (enemyBaseData.walls || []).map(w => ({
      ...w,
      hp: w.hp || 600,
      maxHp: w.maxHp || 600,
      isWall: true,
      width: 1,
      height: 1
    }));

    this.totalInitialBuildingHp = this.buildings.reduce((sum, b) => sum + b.maxHp, 0);

    // Defensive towers
    this.towers = this.buildings
      .filter(b => b.isDefense)
      .map(b => new DefensiveTower(b));

    // Player army
    this.armyDeck = JSON.parse(JSON.stringify(playerArmy || {}));
    this.selectedTroopType = Object.keys(this.armyDeck).find(t => this.armyDeck[t] > 0) || null;

    // Active Combat Entities
    this.troops = [];
    this.damageTexts = [];
    this.projectileEngine = new ProjectileEngine(this);
    this.pathfinder = new PathfindingEngine(this.gridSize);

    // Battle Clock & State
    this.battleTimer = 180; // 3 minutes
    this.isBattleOver = false;
    this.destructionPercent = 0;
    this.stars = 0;
    this.isTownHallDestroyed = false;

    // Compute deployment exclusion zone (Red line)
    this.deploymentExclusion = this.computeDeploymentExclusion();
  }

  computeDeploymentExclusion() {
    const grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(false));
    const allStructures = [...this.buildings, ...this.walls];

    // Margin buffer of 1.5 tiles around every building
    for (const s of allStructures) {
      const minX = Math.max(0, Math.floor(s.x - 1.5));
      const maxX = Math.min(this.gridSize - 1, Math.ceil(s.x + s.width + 0.5));
      const minY = Math.max(0, Math.floor(s.y - 1.5));
      const maxY = Math.min(this.gridSize - 1, Math.ceil(s.y + s.height + 0.5));

      for (let r = minY; r <= maxY; r++) {
        for (let c = minX; c <= maxX; c++) {
          grid[r][c] = true; // Red zone
        }
      }
    }
    return grid;
  }

  canDeployAt(x, y) {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    if (gx < 0 || gx >= this.gridSize || gy < 0 || gy >= this.gridSize) return false;
    return !this.deploymentExclusion[gy][gx];
  }

  deployTroop(type, x, y) {
    if (this.isBattleOver) return false;
    if (!this.armyDeck[type] || this.armyDeck[type] <= 0) return false;
    if (!this.canDeployAt(x, y)) return false;

    this.armyDeck[type]--;
    const troop = new Troop(type, x, y);
    this.troops.push(troop);

    this.renderer.addParticle(x, y, troop.data.color, 10, 40, 0.4);
    return true;
  }

  addDamageText(x, y, text, color = '#ef4444') {
    this.damageTexts.push({
      x,
      y,
      text,
      color,
      life: 0.8,
      maxLife: 0.8
    });
  }

  update(dt) {
    if (this.isBattleOver) return;

    this.battleTimer -= dt;
    if (this.battleTimer <= 0) {
      this.battleTimer = 0;
      this.endBattle();
      return;
    }

    // Update Troops
    for (const troop of this.troops) {
      troop.update(dt, this);
    }

    // Update Towers
    for (const tower of this.towers) {
      tower.update(dt, this);
    }

    // Update Projectiles
    this.projectileEngine.update(dt);

    // Update Damage texts
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const dtObj = this.damageTexts[i];
      dtObj.y -= dt * 0.8; // Float up
      dtObj.life -= dt;
      if (dtObj.life <= 0) {
        this.damageTexts.splice(i, 1);
      }
    }

    this.calculateDestructionAndLoot();

    // Check if battle should end (100% destruction or all deployed troops dead with deck empty)
    const remainingDeck = Object.values(this.armyDeck).reduce((sum, count) => sum + count, 0);
    const activeTroops = this.troops.filter(t => t.hp > 0);

    if (this.destructionPercent >= 100 || (remainingDeck === 0 && activeTroops.length === 0)) {
      this.endBattle();
    }
  }

  calculateDestructionAndLoot() {
    let destroyedHp = 0;
    let totalLootDamageRatio = 0;

    for (const b of this.buildings) {
      const lostHp = b.maxHp - Math.max(0, b.hp);
      destroyedHp += lostHp;

      if (b.type === BUILDING_TYPES.TOWN_HALL && b.hp <= 0 && !this.isTownHallDestroyed) {
        this.isTownHallDestroyed = true;
      }
    }

    this.destructionPercent = Math.min(100, Math.floor((destroyedHp / this.totalInitialBuildingHp) * 100));

    // Calculate Stars
    let stars = 0;
    if (this.destructionPercent >= 50) stars++;
    if (this.isTownHallDestroyed) stars++;
    if (this.destructionPercent >= 100) stars = 3;
    this.stars = stars;

    // Calculate Loot Stolen
    const lootRatio = this.destructionPercent / 100;
    this.stolenLoot.gold = Math.floor(this.initialLoot.gold * lootRatio);
    this.stolenLoot.elixir = Math.floor(this.initialLoot.elixir * lootRatio);
  }

  endBattle() {
    if (this.isBattleOver) return;
    this.isBattleOver = true;
    this.calculateDestructionAndLoot();
  }
}
