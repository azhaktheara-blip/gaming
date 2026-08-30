/**
 * Storage Manager - Handles local progress, best scores, daily streaks, and custom levels.
 */
class StorageManager {
  constructor() {
    this.prefix = 'synapse_';
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Storage read error:', e);
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage write error:', e);
      return false;
    }
  }

  // Progress for specific mode and level
  saveLevelProgress(mode, levelId, data) {
    const allProgress = this.get('progress', {});
    if (!allProgress[mode]) allProgress[mode] = {};
    
    const existing = allProgress[mode][levelId] || { stars: 0, bestMoves: Infinity, bestTime: Infinity };
    
    const updated = {
      completed: true,
      stars: Math.max(existing.stars || 0, data.stars || 0),
      bestMoves: Math.min(existing.bestMoves || Infinity, data.moves || Infinity),
      bestTime: Math.min(existing.bestTime || Infinity, data.time || Infinity),
      timestamp: Date.now()
    };

    allProgress[mode][levelId] = updated;
    this.set('progress', allProgress);
    return updated;
  }

  getLevelProgress(mode, levelId) {
    const allProgress = this.get('progress', {});
    return allProgress[mode]?.[levelId] || null;
  }

  getAllModeProgress(mode) {
    const allProgress = this.get('progress', {});
    return allProgress[mode] || {};
  }

  getTotalStars() {
    const allProgress = this.get('progress', {});
    let total = 0;
    for (const mode in allProgress) {
      for (const lvl in allProgress[mode]) {
        total += allProgress[mode][lvl].stars || 0;
      }
    }
    return total;
  }

  // Daily Challenge History & Streaks
  saveDailyRecord(dateStr, score, stats) {
    const history = this.get('daily_history', {});
    history[dateStr] = {
      score,
      stats,
      completedAt: Date.now()
    };
    this.set('daily_history', history);

    // Calculate current streak
    this.updateDailyStreak(dateStr);
  }

  getDailyRecord(dateStr) {
    const history = this.get('daily_history', {});
    return history[dateStr] || null;
  }

  updateDailyStreak(todayDateStr) {
    const streaks = this.get('streaks', { current: 0, max: 0, lastPlayed: null });
    const today = new Date(todayDateStr);
    
    if (!streaks.lastPlayed) {
      streaks.current = 1;
      streaks.max = 1;
      streaks.lastPlayed = todayDateStr;
    } else {
      const lastDate = new Date(streaks.lastPlayed);
      const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streaks.current += 1;
        if (streaks.current > streaks.max) streaks.max = streaks.current;
        streaks.lastPlayed = todayDateStr;
      } else if (diffDays > 1) {
        streaks.current = 1;
        streaks.lastPlayed = todayDateStr;
      }
    }
    this.set('streaks', streaks);
    return streaks;
  }

  getStreaks() {
    return this.get('streaks', { current: 0, max: 0, lastPlayed: null });
  }

  // Custom User Levels (Created in Level Studio)
  saveCustomLevel(levelData) {
    const customLevels = this.get('custom_levels', []);
    if (!levelData.id) levelData.id = 'custom_' + Date.now();
    levelData.updatedAt = Date.now();

    const idx = customLevels.findIndex(l => l.id === levelData.id);
    if (idx >= 0) {
      customLevels[idx] = levelData;
    } else {
      customLevels.push(levelData);
    }
    this.set('custom_levels', customLevels);
    return levelData;
  }

  getCustomLevels() {
    return this.get('custom_levels', []);
  }

  deleteCustomLevel(id) {
    const customLevels = this.get('custom_levels', []).filter(l => l.id !== id);
    this.set('custom_levels', customLevels);
  }
}

export const storage = new StorageManager();
