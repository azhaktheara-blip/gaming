/**
 * Village Base Manager - Base Layout, Placement, Resource Production, and Army Training
 */

import { BUILDING_TYPES, BUILDINGS_DATA } from './buildingData.js';
import { TROOP_TYPES, TROOPS_DATA } from '../combat/troopAI.js';
import { storage } from '../engine/storage.js';

export class BaseManager {
  constructor() {
    this.gridSize = 34;
    this.resources = storage.getResources();
    this.buildings = storage.getVillageBuildings();
    this.walls = storage.getVillageWalls();
    this.army = storage.getTrainedArmy(); // { barbarian: 10, archer: 15, ... }
    this.trainingQueue = [];

    // Ensure default initial village if empty
    if (!this.buildings || this.buildings.length === 0) {
      this.initDefaultVillage();
    }
  }

  initDefaultVillage() {
    this.buildings = [
      { id: 'th1', type: BUILDING_TYPES.TOWN_HALL, x: 15, y: 15, level: 1, hp: 1500, maxHp: 1500, ...BUILDINGS_DATA[BUILDING_TYPES.TOWN_HALL] },
      { id: 'gm1', type: BUILDING_TYPES.GOLD_MINE, x: 11, y: 15, level: 1, hp: 400, maxHp: 400, accumulated: 0, ...BUILDINGS_DATA[BUILDING_TYPES.GOLD_MINE] },
      { id: 'ec1', type: BUILDING_TYPES.ELIXIR_COLLECTOR, x: 20, y: 15, level: 1, hp: 400, maxHp: 400, accumulated: 0, ...BUILDINGS_DATA[BUILDING_TYPES.ELIXIR_COLLECTOR] },
      { id: 'gs1', type: BUILDING_TYPES.GOLD_STORAGE, x: 12, y: 18, level: 1, hp: 800, maxHp: 800, ...BUILDINGS_DATA[BUILDING_TYPES.GOLD_STORAGE] },
      { id: 'es1', type: BUILDING_TYPES.ELIXIR_STORAGE, x: 19, y: 18, level: 1, hp: 800, maxHp: 800, ...BUILDINGS_DATA[BUILDING_TYPES.ELIXIR_STORAGE] },
      { id: 'b1', type: BUILDING_TYPES.BARRACKS, x: 11, y: 12, level: 1, hp: 350, maxHp: 350, ...BUILDINGS_DATA[BUILDING_TYPES.BARRACKS] },
      { id: 'ac1', type: BUILDING_TYPES.ARMY_CAMP, x: 19, y: 11, level: 1, hp: 300, maxHp: 300, ...BUILDINGS_DATA[BUILDING_TYPES.ARMY_CAMP] },
      { id: 'c1', type: BUILDING_TYPES.CANNON, x: 15, y: 11, level: 1, hp: 550, maxHp: 550, ...BUILDINGS_DATA[BUILDING_TYPES.CANNON] }
    ];

    this.walls = [];
    this.saveVillage();
  }

  saveVillage() {
    storage.saveResources(this.resources);
    storage.saveVillageBuildings(this.buildings);
    storage.saveVillageWalls(this.walls);
    storage.saveTrainedArmy(this.army);
  }

  // Update resource production and troop training every frame
  update(dt) {
    // 1. Passive Resource Generation
    for (const b of this.buildings) {
      if (b.productionRate && b.capacity) {
        if (b.accumulated === undefined) b.accumulated = 0;
        b.accumulated = Math.min(b.capacity, b.accumulated + b.productionRate * dt);
      }
    }

    // 2. Troop Training Queue
    if (this.trainingQueue.length > 0) {
      const current = this.trainingQueue[0];
      current.timer -= dt;

      if (current.timer <= 0) {
        // Trained! Add to army
        if (!this.army[current.type]) this.army[current.type] = 0;
        this.army[current.type]++;
        this.trainingQueue.shift();
        this.saveVillage();
      }
    }
  }

  collectBuildingResources(buildingId) {
    const b = this.buildings.find(item => item.id === buildingId);
    if (!b || !b.accumulated || b.accumulated < 1) return 0;

    const amount = Math.floor(b.accumulated);
    b.accumulated -= amount;

    if (b.type === BUILDING_TYPES.GOLD_MINE) {
      this.resources.gold = Math.min(this.getMaxGoldCapacity(), this.resources.gold + amount);
    } else if (b.type === BUILDING_TYPES.ELIXIR_COLLECTOR) {
      this.resources.elixir = Math.min(this.getMaxElixirCapacity(), this.resources.elixir + amount);
    }

    this.saveVillage();
    return amount;
  }

  getMaxGoldCapacity() {
    let cap = 5000; // Base TH capacity
    this.buildings.filter(b => b.type === BUILDING_TYPES.GOLD_STORAGE).forEach(s => cap += s.capacity || 10000);
    return cap;
  }

  getMaxElixirCapacity() {
    let cap = 5000;
    this.buildings.filter(b => b.type === BUILDING_TYPES.ELIXIR_STORAGE).forEach(s => cap += s.capacity || 10000);
    return cap;
  }

  getMaxArmyHousing() {
    let space = 20; // Base capacity
    this.buildings.filter(b => b.type === BUILDING_TYPES.ARMY_CAMP).forEach(ac => space += ac.housingCapacity || 40);
    return space;
  }

  getCurrentArmyHousing() {
    let total = 0;
    for (const type in this.army) {
      const count = this.army[type] || 0;
      const unitSpace = TROOPS_DATA[type]?.housingSpace || 1;
      total += count * unitSpace;
    }
    return total;
  }

  canTrainTroop(type) {
    const data = TROOPS_DATA[type];
    if (!data) return false;

    // Check housing
    if (this.getCurrentArmyHousing() + data.housingSpace > this.getMaxArmyHousing()) {
      return { success: false, reason: 'Army Camps full!' };
    }

    // Check elixir cost
    if (this.resources.elixir < data.trainingCost.elixir) {
      return { success: false, reason: 'Not enough Elixir!' };
    }

    return { success: true };
  }

  queueTroopTraining(type) {
    const check = this.canTrainTroop(type);
    if (!check.success) return check;

    const data = TROOPS_DATA[type];
    this.resources.elixir -= data.trainingCost.elixir;

    this.trainingQueue.push({
      type,
      timer: data.trainingTime,
      totalTime: data.trainingTime
    });

    this.saveVillage();
    return { success: true };
  }

  canPlaceBuildingAt(type, x, y, width, height, ignoreBuildingId = null) {
    if (x < 1 || y < 1 || x + width >= this.gridSize - 1 || y + height >= this.gridSize - 1) {
      return false;
    }

    // Check collision with existing buildings
    for (const b of this.buildings) {
      if (ignoreBuildingId && b.id === ignoreBuildingId) continue;
      if (x < b.x + b.width && x + width > b.x && y < b.y + b.height && y + height > b.y) {
        return false;
      }
    }

    // Check collision with walls
    for (const w of this.walls) {
      if (x <= w.x && x + width > w.x && y <= w.y && y + height > w.y) {
        return false;
      }
    }

    return true;
  }

  placeNewBuilding(type, x, y) {
    const data = BUILDINGS_DATA[type];
    if (!data) return false;

    if (!this.canPlaceBuildingAt(type, x, y, data.width, data.height)) {
      return false;
    }

    // Deduct cost
    if (data.baseCost.gold && this.resources.gold < data.baseCost.gold) return false;
    if (data.baseCost.elixir && this.resources.elixir < data.baseCost.elixir) return false;

    this.resources.gold -= data.baseCost.gold || 0;
    this.resources.elixir -= data.baseCost.elixir || 0;

    if (type === BUILDING_TYPES.WALL) {
      this.walls.push({
        id: 'w_' + Date.now() + Math.random(),
        x,
        y,
        hp: data.hp,
        maxHp: data.hp
      });
    } else {
      this.buildings.push({
        id: 'b_' + Date.now() + Math.random(),
        type,
        x,
        y,
        level: 1,
        hp: data.hp,
        maxHp: data.hp,
        ...data
      });
    }

    this.saveVillage();
    return true;
  }

  moveBuilding(buildingId, newX, newY) {
    const b = this.buildings.find(item => item.id === buildingId);
    if (!b) return false;

    if (!this.canPlaceBuildingAt(b.type, newX, newY, b.width, b.height, b.id)) {
      return false;
    }

    b.x = newX;
    b.y = newY;
    this.saveVillage();
    return true;
  }
}
