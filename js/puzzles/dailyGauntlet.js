/**
 * Daily Cognitive Gauntlet
 * Generates deterministic daily brain challenges and calculates Cognitive Quotient (CQ).
 */
import { generateProceduralOpticsLevel } from './opticsLevels.js';
import { generateProceduralChronoLevel } from './chronoLevels.js';
import { generateProceduralCipherLevel } from './cipherLevels.js';
import { storage } from '../engine/storage.js';

export class DailyGauntlet {
  static getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static getSeedForDate(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  static getDailyChallenges(dateStr = DailyGauntlet.getTodayDateString()) {
    const seed = DailyGauntlet.getSeedForDate(dateStr);
    
    return [
      {
        stage: 1,
        mode: 'optics',
        title: 'Gauntlet: Quantum Alignment',
        levelData: generateProceduralOpticsLevel(seed, 'Normal')
      },
      {
        stage: 2,
        mode: 'chrono',
        title: 'Gauntlet: Paradox Loop',
        levelData: generateProceduralChronoLevel(seed + 101, 'Normal')
      },
      {
        stage: 3,
        mode: 'cipher',
        title: 'Gauntlet: Synaptic Circuit',
        levelData: generateProceduralCipherLevel(seed + 202, 'Normal')
      }
    ];
  }

  // Calculate CQ (Cognitive Quotient, baseline 100 to max 160)
  static calculateCQ(totalTimeSec, totalMoves, hintsUsed) {
    let baseCQ = 135;
    
    // Time modifier (par time 120s)
    const timeDelta = 120 - totalTimeSec;
    baseCQ += Math.max(-25, Math.min(20, Math.round(timeDelta / 5)));

    // Move efficiency modifier
    baseCQ -= Math.max(0, (totalMoves - 20) * 1.5);

    // Hint penalty
    baseCQ -= hintsUsed * 8;

    return Math.max(90, Math.min(160, Math.round(baseCQ)));
  }
}
