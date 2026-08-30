import { OpticsEngine } from '../js/puzzles/opticsEngine.js';
import { OPTICS_LEVELS } from '../js/puzzles/opticsLevels.js';
import { ChronoEngine } from '../js/puzzles/chronoEngine.js';
import { CHRONO_LEVELS } from '../js/puzzles/chronoLevels.js';
import { CipherEngine } from '../js/puzzles/cipherEngine.js';
import { CIPHER_LEVELS } from '../js/puzzles/cipherLevels.js';
import { DailyGauntlet } from '../js/puzzles/dailyGauntlet.js';

console.log('--- Testing Optics Engine ---');
const optics = new OpticsEngine(OPTICS_LEVELS[0]);
console.log('Initial Solved State:', optics.isSolved);
optics.placeItem('mirror', 4, 1, 135, 'cyan');
console.log('After Placing Mirror (4,1,135): Solved =', optics.isSolved);
if (!optics.isSolved) {
  console.error('Optics test failed!');
  process.exit(1);
}

console.log('--- Testing Chrono Engine ---');
const chrono = new ChronoEngine(CHRONO_LEVELS[0]);
console.log('Chrono Initial Solved:', chrono.isSolved);

// In Timeline 1: Walk to switch (3,1) and stay on it
chrono.movePlayer(1, 0); // (2,3) t=1
chrono.movePlayer(1, 0); // (3,3) t=2
chrono.movePlayer(0, -1); // (3,2) t=3
chrono.movePlayer(0, -1); // (3,1) t=4 - ON PLATE
chrono.triggerParadoxLoop();
console.log('Loop 2 started. Ghosts count:', chrono.recordedTimelines.length);

// In Timeline 2: Move in sync with ghost
chrono.movePlayer(1, 0);  // (2,3) t=1
chrono.movePlayer(0, 1);  // (2,4) t=2
chrono.movePlayer(1, 0);  // (3,4) t=3
chrono.movePlayer(0, -1); // (3,3) t=4
chrono.movePlayer(1, 0);  // (4,3) t=5 (Walks through open door!)
chrono.movePlayer(1, 0);  // (5,3) t=6 (Reaches exit portal!)
console.log('Chrono Loop 2 Solved:', chrono.isSolved);
if (!chrono.isSolved) {
  console.error('Chrono test failed!');
  process.exit(1);
}

console.log('--- Testing Cipher Engine ---');
const cipher = new CipherEngine(CIPHER_LEVELS[0]);
console.log('Cipher Initial Solved:', cipher.isSolved);
cipher.toggleInput('A');
cipher.toggleInput('B');
console.log('Cipher Solved after A=1, B=1:', cipher.isSolved);
if (!cipher.isSolved) {
  console.error('Cipher test failed!');
  process.exit(1);
}

console.log('--- Testing Daily Gauntlet & CQ ---');
const todaySeed = DailyGauntlet.getSeedForDate('2026-08-30');
console.log('Generated Seed:', todaySeed);
const cq = DailyGauntlet.calculateCQ(45, 12, 0);
console.log('Calculated CQ Score:', cq);
if (cq < 100 || cq > 160) {
  console.error('CQ calculation error!');
  process.exit(1);
}

console.log('🎉 ALL AUTOMATED ENGINE TESTS PASSED PERFECTLY!');
