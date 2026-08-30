import { BaseManager } from '../js/village/baseManager.js';
import { BUILDING_TYPES, BUILDINGS_DATA } from '../js/village/buildingData.js';
import { Troop, TROOP_TYPES, TROOPS_DATA } from '../js/combat/troopAI.js';
import { DefensiveTower } from '../js/combat/towerAI.js';
import { BattleManager } from '../js/combat/battleManager.js';
import { PathfindingEngine } from '../js/engine/pathfinding.js';
import { CAMPAIGN_BASES } from '../js/campaigns/enemyBases.js';

console.log('--- 1. Testing BaseManager & Village Economy ---');
const base = new BaseManager();
console.log('Initial Buildings count:', base.buildings.length);
if (base.buildings.length < 5) {
  console.error('BaseManager initialization failed!');
  process.exit(1);
}

// Test Resource Collection
base.buildings[1].accumulated = 500; // Gold Mine
const collected = base.collectBuildingResources(base.buildings[1].id);
console.log('Collected gold from mine:', collected);
if (collected !== 500) {
  console.error('Resource collection failed!');
  process.exit(1);
}

// Test Troop Training Queue
base.resources.elixir = 1000;
const trainResult = base.queueTroopTraining(TROOP_TYPES.BARBARIAN);
console.log('Queued Barbarian training:', trainResult.success);
if (!trainResult.success) {
  console.error('Troop training queue failed!');
  process.exit(1);
}

console.log('--- 2. Testing A* Pathfinding ---');
const pathfinder = new PathfindingEngine(34);
const path = pathfinder.findPath(5, 5, 10, 10, true);
console.log('Calculated Path Nodes:', path.length);
if (!path || path.length === 0) {
  console.error('Pathfinding failed!');
  process.exit(1);
}

console.log('--- 3. Testing BattleManager & Specialized AI ---');
const mockRenderer = {
  addParticle: () => {},
  triggerShake: () => {}
};
const battle = new BattleManager(CAMPAIGN_BASES[0], { barbarian: 5, giant: 2, goblin: 5 }, mockRenderer);

// Test Deployment
console.log('Can deploy at corner (2,2):', battle.canDeployAt(2, 2));
const deployedGiant = battle.deployTroop(TROOP_TYPES.GIANT, 2, 2);
console.log('Deployed Giant:', deployedGiant);
if (!deployedGiant || battle.troops.length !== 1) {
  console.error('Troop deployment failed!');
  process.exit(1);
}

// Giant should target Cannon
battle.troops[0].findBestTarget(battle);
console.log('Giant Target Building Type:', battle.troops[0].targetBuilding?.type);
if (battle.troops[0].targetBuilding?.type !== BUILDING_TYPES.CANNON) {
  console.error('Giant AI failed to prioritize defense!');
  process.exit(1);
}

// Deploy Goblin - should target Gold/Elixir
battle.deployTroop(TROOP_TYPES.GOBLIN, 2, 2);
battle.troops[1].findBestTarget(battle);
console.log('Goblin Target Building isResource:', battle.troops[1].targetBuilding?.isResource);
if (!battle.troops[1].targetBuilding?.isResource) {
  console.error('Goblin AI failed to prioritize resources!');
  process.exit(1);
}

// Simulate combat destruction
battle.buildings.forEach(b => b.hp = 0);
battle.calculateDestructionAndLoot();
console.log('Destruction %:', battle.destructionPercent);
console.log('Stars earned:', battle.stars);
if (battle.destructionPercent !== 100 || battle.stars !== 3) {
  console.error('Destruction scoring calculation failed!');
  process.exit(1);
}

console.log('🎉 ALL CLASH OF REALMS STRATEGY & AI TESTS PASSED PERFECTLY!');
