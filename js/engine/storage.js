/**
 * Realm Clash - Persistence Storage Manager
 * Cross-platform persistence (browser localStorage + Node in-memory fallback for unit tests)
 */

class StorageManager {
  constructor() {
    this.prefix = 'clash_';
    this.memoryStore = {};
  }

  get(key, defaultValue = null) {
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(this.prefix + key);
        return item !== null ? JSON.parse(item) : defaultValue;
      }
      return this.memoryStore[this.prefix + key] ?? defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
      }
      this.memoryStore[this.prefix + key] = value;
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- RESOURCES ---
  getResources() {
    return this.get('resources', {
      gold: 2500,
      elixir: 2500,
      gems: 50
    });
  }

  saveResources(res) {
    this.set('resources', res);
  }

  // --- VILLAGE BASE & WALLS ---
  getVillageBuildings() {
    return this.get('village_buildings', []);
  }

  saveVillageBuildings(buildings) {
    this.set('village_buildings', buildings);
  }

  getVillageWalls() {
    return this.get('village_walls', []);
  }

  saveVillageWalls(walls) {
    this.set('village_walls', walls);
  }

  // --- TRAINED ARMY ---
  getTrainedArmy() {
    return this.get('trained_army', {
      barbarian: 15,
      archer: 10,
      giant: 2,
      goblin: 8,
      wall_breaker: 2,
      wizard: 2
    });
  }

  saveTrainedArmy(army) {
    this.set('trained_army', army);
  }

  // --- CAMPAIGN PROGRESS ---
  getCampaignStars() {
    return this.get('campaign_stars', {});
  }

  saveCampaignStars(baseId, stars) {
    const all = this.getCampaignStars();
    all[baseId] = Math.max(all[baseId] || 0, stars);
    this.set('campaign_stars', all);
  }
}

export const storage = new StorageManager();
