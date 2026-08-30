/**
 * Realm Clash - Main Game Coordinator and State Orchestrator
 */

import { IsometricRenderer } from './engine/isometricRenderer.js';
import { BaseManager } from './village/baseManager.js';
import { BattleManager } from './combat/battleManager.js';
import { CAMPAIGN_BASES, generateProceduralEnemyBase } from './campaigns/enemyBases.js';
import { VillageHUD } from './ui/villageHud.js';
import { BattleHUD } from './ui/battleHud.js';
import { soundManager } from './audio/soundManager.js';
import { storage } from './engine/storage.js';
import { DialogManager } from './ui/dialogManager.js';

class RealmClashApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new IsometricRenderer(this.canvas);
    this.baseManager = new BaseManager();

    this.gameState = 'VILLAGE'; // 'VILLAGE' | 'BATTLE'
    this.activeBattle = null;
    this.campaignIndex = 0;
    this.pendingBuildType = null;
    this.hoverGrid = { gx: -1, gy: -1 };

    this.villageHUD = new VillageHUD(
      this.baseManager,
      this.startCampaignRaid.bind(this),
      this.startBuildingPlacement.bind(this)
    );

    this.battleHUD = new BattleHUD(this.returnToVillage.bind(this));

    this.lastTime = performance.now();
    this.bindCanvasInput();
    this.init();
  }

  init() {
    this.villageHUD.updateHUD();
    this.updateUIMode();

    requestAnimationFrame(this.gameLoop.bind(this));

    // Audio unlock on user gesture
    const unlockAudio = () => {
      soundManager.init();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);

    DialogManager.showToast('Welcome to Realm Clash! Build your kingdom and prepare for war.');
  }

  updateUIMode() {
    const villageUI = document.getElementById('village-ui-layer');
    const battleUI = document.getElementById('battle-ui-layer');

    if (this.gameState === 'VILLAGE') {
      if (villageUI) villageUI.style.display = 'flex';
      if (battleUI) battleUI.style.display = 'none';
      this.villageHUD.updateHUD();
    } else {
      if (villageUI) villageUI.style.display = 'none';
      if (battleUI) battleUI.style.display = 'flex';
      if (this.activeBattle) {
        this.battleHUD.renderDeck(this.activeBattle);
        this.battleHUD.updateBattleHUD(this.activeBattle);
      }
    }
  }

  startBuildingPlacement(buildingType) {
    this.pendingBuildType = buildingType;
    DialogManager.showToast('Click a green tile to construct your building.');
  }

  startCampaignRaid(index = 0) {
    this.campaignIndex = index;
    const enemyBase = CAMPAIGN_BASES[index] || generateProceduralEnemyBase(Date.now());

    // Check if player has any troops
    const totalArmy = Object.values(this.baseManager.army).reduce((sum, c) => sum + c, 0);
    if (totalArmy <= 0) {
      DialogManager.showToast('Train troops in your Barracks before attacking!', 'error');
      return;
    }

    this.activeBattle = new BattleManager(enemyBase, this.baseManager.army, this.renderer);
    this.gameState = 'BATTLE';
    this.updateUIMode();
    soundManager.playClick();
    DialogManager.showToast(`Invading ${enemyBase.name}! Deploy troops outside the red boundary.`);
  }

  returnToVillage() {
    if (this.activeBattle) {
      // Award stolen loot
      this.baseManager.resources.gold = Math.min(
        this.baseManager.getMaxGoldCapacity(),
        this.baseManager.resources.gold + this.activeBattle.stolenLoot.gold
      );
      this.baseManager.resources.elixir = Math.min(
        this.baseManager.getMaxElixirCapacity(),
        this.baseManager.resources.elixir + this.activeBattle.stolenLoot.elixir
      );

      // Save campaign stars
      if (this.activeBattle.stars > 0) {
        storage.saveCampaignStars(CAMPAIGN_BASES[this.campaignIndex]?.id || 'custom', this.activeBattle.stars);
      }

      // Update remaining army back to base
      this.baseManager.army = JSON.parse(JSON.stringify(this.activeBattle.armyDeck));
      this.baseManager.saveVillage();
      this.activeBattle = null;
    }

    this.gameState = 'VILLAGE';
    this.updateUIMode();
    this.villageHUD.updateHUD();
  }

  bindCanvasInput() {
    const canvas = this.canvas;

    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      this.hoverGrid = this.renderer.screenToGrid(sx, sy);
    });

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const { gx, gy } = this.renderer.screenToGrid(sx, sy);

      if (this.gameState === 'VILLAGE') {
        this.handleVillagePointerDown(gx, gy);
      } else if (this.gameState === 'BATTLE') {
        this.handleBattlePointerDown(gx, gy);
      }
    });
  }

  handleVillagePointerDown(gx, gy) {
    const ix = Math.floor(gx);
    const iy = Math.floor(gy);

    if (this.pendingBuildType) {
      // Place building
      const placed = this.baseManager.placeNewBuilding(this.pendingBuildType, ix, iy);
      if (placed) {
        soundManager.playSwitch();
        this.renderer.addParticle(ix + 1, iy + 1, '#10b981', 20, 50, 0.5);
        DialogManager.showToast('Construction complete!');
        this.pendingBuildType = null;
        this.villageHUD.updateHUD();
      } else {
        DialogManager.showToast('Cannot place building here!', 'error');
      }
      return;
    }

    // Check if clicked building
    const clicked = this.baseManager.buildings.find(
      b => ix >= b.x && ix < b.x + b.width && iy >= b.y && iy < b.y + b.height
    );

    if (clicked) {
      // Collect resources if available
      const collected = this.baseManager.collectBuildingResources(clicked.id);
      if (collected > 0) {
        soundManager.playClick();
        this.renderer.addParticle(clicked.x + 1, clicked.y + 1, '#f59e0b', 15, 60, 0.5);
        this.villageHUD.updateHUD();
        DialogManager.showToast(`Collected +${collected} resources!`);
      } else {
        this.villageHUD.selectBuilding(clicked);
      }
    } else {
      this.villageHUD.deselectBuilding();
    }
  }

  handleBattlePointerDown(gx, gy) {
    if (!this.activeBattle || this.activeBattle.isBattleOver) return;

    const troopType = this.battleHUD.selectedTroopType;
    if (!troopType) return;

    const deployed = this.activeBattle.deployTroop(troopType, gx, gy);
    if (deployed) {
      soundManager.playStep();
      this.battleHUD.renderDeck(this.activeBattle);
    } else {
      DialogManager.showToast('Cannot deploy in the red defensive zone!', 'error');
    }
  }

  gameLoop(timestamp) {
    const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.renderer.clear();
    this.renderer.update(dt);

    if (this.gameState === 'VILLAGE') {
      this.baseManager.update(dt);
      this.villageHUD.updateHUD();

      // Render Village
      this.renderer.drawTerrain(this.baseManager.gridSize, null, this.hoverGrid);

      // Depth sort buildings and walls
      const allEntities = [
        ...this.baseManager.buildings.map(b => ({ ...b, sortY: b.y + b.height, isBuilding: true })),
        ...this.baseManager.walls.map(w => ({ ...w, sortY: w.y + 1, isWall: true }))
      ];
      allEntities.sort((a, b) => a.sortY - b.sortY);

      for (const ent of allEntities) {
        if (ent.isBuilding) this.renderer.drawBuilding(ent, true);
        else if (ent.isWall) this.renderer.drawWall(ent, true);
      }

    } else if (this.gameState === 'BATTLE' && this.activeBattle) {
      this.activeBattle.update(dt);
      this.battleHUD.updateBattleHUD(this.activeBattle);

      // Check battle end
      if (this.activeBattle.isBattleOver && !this.activeBattle._reportShown) {
        this.activeBattle._reportShown = true;
        soundManager.playVictory();
        setTimeout(() => {
          this.battleHUD.showBattleReport(this.activeBattle);
        }, 800);
      }

      // Render Battle
      this.renderer.drawTerrain(this.activeBattle.gridSize, this.activeBattle.deploymentExclusion, this.hoverGrid);

      // Depth sort buildings, walls, and troops
      const allEntities = [
        ...this.activeBattle.buildings.map(b => ({ ...b, sortY: b.y + b.height, isBuilding: true })),
        ...this.activeBattle.walls.map(w => ({ ...w, sortY: w.y + 1, isWall: true })),
        ...this.activeBattle.troops.map(t => ({ ...t, sortY: t.y, isTroop: true }))
      ];
      allEntities.sort((a, b) => a.sortY - b.sortY);

      for (const ent of allEntities) {
        if (ent.isBuilding) this.renderer.drawBuilding(ent, false);
        else if (ent.isWall) this.renderer.drawWall(ent, false);
        else if (ent.isTroop) this.renderer.drawTroop(ent);
      }

      // Draw Projectiles
      for (const p of this.activeBattle.projectileEngine.projectiles) {
        this.renderer.drawProjectile(p);
      }

      // Draw Damage Text
      for (const dtObj of this.activeBattle.damageTexts) {
        this.renderer.drawDamageText(dtObj);
      }
    }

    this.renderer.drawParticles();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.clashApp = new RealmClashApp();
});
