/**
 * Campaign Enemy Bases and Procedural AI Base Generator
 */

import { BUILDING_TYPES, BUILDINGS_DATA } from '../village/buildingData.js';

export const CAMPAIGN_BASES = [
  {
    id: 'campaign_1',
    name: 'Goblin Outpost',
    loot: { gold: 1200, elixir: 1200 },
    gridSize: 34,
    buildings: [
      { id: 'th1', type: BUILDING_TYPES.TOWN_HALL, x: 15, y: 15, hp: 1200, maxHp: 1200 },
      { id: 'gm1', type: BUILDING_TYPES.GOLD_MINE, x: 12, y: 15, hp: 400, maxHp: 400 },
      { id: 'ec1', type: BUILDING_TYPES.ELIXIR_COLLECTOR, x: 19, y: 15, hp: 400, maxHp: 400 },
      { id: 'c1', type: BUILDING_TYPES.CANNON, x: 16, y: 12, hp: 450, maxHp: 450 }
    ],
    walls: []
  },
  {
    id: 'campaign_2',
    name: 'Stone Bastion',
    loot: { gold: 3500, elixir: 3500 },
    gridSize: 34,
    buildings: [
      { id: 'th1', type: BUILDING_TYPES.TOWN_HALL, x: 15, y: 15, hp: 1500, maxHp: 1500 },
      { id: 'c1', type: BUILDING_TYPES.CANNON, x: 12, y: 14, hp: 500, maxHp: 500 },
      { id: 'at1', type: BUILDING_TYPES.ARCHER_TOWER, x: 19, y: 14, hp: 450, maxHp: 450 },
      { id: 'gs1', type: BUILDING_TYPES.GOLD_STORAGE, x: 14, y: 19, hp: 800, maxHp: 800 },
      { id: 'es1', type: BUILDING_TYPES.ELIXIR_STORAGE, x: 17, y: 19, hp: 800, maxHp: 800 }
    ],
    walls: [
      // Perimeter Box
      { x: 10, y: 11, hp: 600, maxHp: 600 }, { x: 11, y: 11, hp: 600, maxHp: 600 }, { x: 12, y: 11, hp: 600, maxHp: 600 },
      { x: 13, y: 11, hp: 600, maxHp: 600 }, { x: 14, y: 11, hp: 600, maxHp: 600 }, { x: 15, y: 11, hp: 600, maxHp: 600 },
      { x: 16, y: 11, hp: 600, maxHp: 600 }, { x: 17, y: 11, hp: 600, maxHp: 600 }, { x: 18, y: 11, hp: 600, maxHp: 600 },
      { x: 19, y: 11, hp: 600, maxHp: 600 }, { x: 20, y: 11, hp: 600, maxHp: 600 }, { x: 21, y: 11, hp: 600, maxHp: 600 },
      { x: 10, y: 22, hp: 600, maxHp: 600 }, { x: 11, y: 22, hp: 600, maxHp: 600 }, { x: 12, y: 22, hp: 600, maxHp: 600 },
      { x: 13, y: 22, hp: 600, maxHp: 600 }, { x: 14, y: 22, hp: 600, maxHp: 600 }, { x: 15, y: 22, hp: 600, maxHp: 600 },
      { x: 16, y: 22, hp: 600, maxHp: 600 }, { x: 17, y: 22, hp: 600, maxHp: 600 }, { x: 18, y: 22, hp: 600, maxHp: 600 },
      { x: 19, y: 22, hp: 600, maxHp: 600 }, { x: 20, y: 22, hp: 600, maxHp: 600 }, { x: 21, y: 22, hp: 600, maxHp: 600 }
    ]
  },
  {
    id: 'campaign_3',
    name: 'Iron Stronghold',
    loot: { gold: 8000, elixir: 8000 },
    gridSize: 34,
    buildings: [
      { id: 'th1', type: BUILDING_TYPES.TOWN_HALL, x: 15, y: 15, hp: 2000, maxHp: 2000 },
      { id: 'm1', type: BUILDING_TYPES.MORTAR, x: 15, y: 12, hp: 550, maxHp: 550 },
      { id: 'c1', type: BUILDING_TYPES.CANNON, x: 11, y: 15, hp: 550, maxHp: 550 },
      { id: 'at1', type: BUILDING_TYPES.ARCHER_TOWER, x: 20, y: 15, hp: 500, maxHp: 500 },
      { id: 'c2', type: BUILDING_TYPES.CANNON, x: 15, y: 19, hp: 550, maxHp: 550 },
      { id: 'gs1', type: BUILDING_TYPES.GOLD_STORAGE, x: 12, y: 12, hp: 900, maxHp: 900 },
      { id: 'es1', type: BUILDING_TYPES.ELIXIR_STORAGE, x: 19, y: 12, hp: 900, maxHp: 900 }
    ],
    walls: []
  },
  {
    id: 'campaign_4',
    name: 'Mystic Citadel',
    loot: { gold: 15000, elixir: 15000 },
    gridSize: 34,
    buildings: [
      { id: 'th1', type: BUILDING_TYPES.TOWN_HALL, x: 15, y: 15, hp: 2500, maxHp: 2500 },
      { id: 'wt1', type: BUILDING_TYPES.WIZARD_TOWER, x: 15, y: 11, hp: 650, maxHp: 650 },
      { id: 'm1', type: BUILDING_TYPES.MORTAR, x: 15, y: 19, hp: 600, maxHp: 600 },
      { id: 'at1', type: BUILDING_TYPES.ARCHER_TOWER, x: 10, y: 15, hp: 550, maxHp: 550 },
      { id: 'at2', type: BUILDING_TYPES.ARCHER_TOWER, x: 21, y: 15, hp: 550, maxHp: 550 },
      { id: 'c1', type: BUILDING_TYPES.CANNON, x: 11, y: 11, hp: 600, maxHp: 600 },
      { id: 'c2', type: BUILDING_TYPES.CANNON, x: 20, y: 11, hp: 600, maxHp: 600 }
    ],
    walls: []
  }
];

export function generateProceduralEnemyBase(seed = Date.now(), difficulty = 1) {
  const gridSize = 34;
  const buildings = [];
  const walls = [];

  // Town Hall in center
  buildings.push({
    id: 'th1',
    type: BUILDING_TYPES.TOWN_HALL,
    x: 15,
    y: 15,
    hp: 1500 + difficulty * 300,
    maxHp: 1500 + difficulty * 300
  });

  // Cannons
  const cannonCount = 1 + Math.min(3, difficulty);
  for (let i = 0; i < cannonCount; i++) {
    const angle = (i / cannonCount) * Math.PI * 2;
    const cx = Math.round(15 + Math.cos(angle) * 5);
    const cy = Math.round(15 + Math.sin(angle) * 5);
    buildings.push({
      id: `c_${i}`,
      type: BUILDING_TYPES.CANNON,
      x: cx,
      y: cy,
      hp: 500 + difficulty * 80,
      maxHp: 500 + difficulty * 80
    });
  }

  // Storages & Mines
  buildings.push({
    id: 'gs1',
    type: BUILDING_TYPES.GOLD_STORAGE,
    x: 12,
    y: 15,
    hp: 800,
    maxHp: 800
  });
  buildings.push({
    id: 'es1',
    type: BUILDING_TYPES.ELIXIR_STORAGE,
    x: 19,
    y: 15,
    hp: 800,
    maxHp: 800
  });

  if (difficulty >= 2) {
    buildings.push({
      id: 'm1',
      type: BUILDING_TYPES.MORTAR,
      x: 15,
      y: 11,
      hp: 550,
      maxHp: 550
    });
  }

  return {
    id: `proc_base_${seed}`,
    name: `Goblin Stronghold #${Math.abs(seed % 999)}`,
    loot: { gold: 3000 * difficulty, elixir: 3000 * difficulty },
    gridSize,
    buildings,
    walls
  };
}
