/**
 * Troop Definitions and Specialized Behavioral AI State Machine
 */

export const TROOP_TYPES = {
  BARBARIAN: 'barbarian',
  ARCHER: 'archer',
  GIANT: 'giant',
  GOBLIN: 'goblin',
  WALL_BREAKER: 'wall_breaker',
  WIZARD: 'wizard'
};

export const TROOPS_DATA = {
  [TROOP_TYPES.BARBARIAN]: {
    name: 'Barbarian',
    trainingCost: { elixir: 25 },
    trainingTime: 3,
    housingSpace: 1,
    hp: 140,
    damage: 22,
    attackSpeed: 1.0, // Seconds per attack
    range: 0.8,       // Melee
    speed: 2.4,       // Tiles per second
    targetPriority: 'any',
    description: 'Fearless melee warrior who charges the nearest structure.',
    color: '#f59e0b',
    icon: '⚔️'
  },
  [TROOP_TYPES.ARCHER]: {
    name: 'Archer',
    trainingCost: { elixir: 40 },
    trainingTime: 4,
    housingSpace: 1,
    hp: 75,
    damage: 16,
    attackSpeed: 0.8,
    range: 3.8,       // Ranged - shoots over walls
    speed: 2.7,
    targetPriority: 'any',
    description: 'Sharp-eyed marksman who fires arrows over walls.',
    color: '#ec4899',
    icon: '🏹'
  },
  [TROOP_TYPES.GIANT]: {
    name: 'Giant',
    trainingCost: { elixir: 150 },
    trainingTime: 10,
    housingSpace: 5,
    hp: 750,
    damage: 24,
    attackSpeed: 1.5,
    range: 0.9,
    speed: 1.4,
    targetPriority: 'defense',
    description: 'Massive armored powerhouse that focuses solely on enemy defenses.',
    color: '#d97706',
    icon: '🛡️'
  },
  [TROOP_TYPES.GOBLIN]: {
    name: 'Goblin',
    trainingCost: { elixir: 35 },
    trainingTime: 3,
    housingSpace: 1,
    hp: 80,
    damage: 20,
    resourceMultiplier: 2.0, // 2x damage against Gold/Elixir
    attackSpeed: 0.8,
    range: 0.8,
    speed: 4.0,       // Fastest unit
    targetPriority: 'resource',
    description: 'Agile plunderer who dashes straight for Gold & Elixir storages.',
    color: '#10b981',
    icon: '💰'
  },
  [TROOP_TYPES.WALL_BREAKER]: {
    name: 'Wall Breaker',
    trainingCost: { elixir: 100 },
    trainingTime: 6,
    housingSpace: 2,
    hp: 60,
    damage: 25,
    wallMultiplier: 12.0, // Massive wall destruction
    attackSpeed: 1.0,
    range: 0.8,
    speed: 3.6,
    isSuicide: true,
    targetPriority: 'wall',
    description: 'Explosive bomber that seeks and demolishes wall barricades.',
    color: '#64748b',
    icon: '💣'
  },
  [TROOP_TYPES.WIZARD]: {
    name: 'Wizard',
    trainingCost: { elixir: 200 },
    trainingTime: 12,
    housingSpace: 4,
    hp: 170,
    damage: 48,
    splashRadius: 1.2,
    attackSpeed: 1.4,
    range: 3.5,
    speed: 2.2,
    targetPriority: 'any',
    description: 'Mystic sorcerer unleashing destructive area-of-effect firestorms.',
    color: '#8b5cf6',
    icon: '🔮'
  }
};

export class Troop {
  constructor(type, x, y, id = Math.random().toString(36).substr(2, 9)) {
    this.id = id;
    this.type = type;
    this.data = TROOPS_DATA[type];
    this.x = x;
    this.y = y;
    this.hp = this.data.hp;
    this.maxHp = this.data.hp;
    this.speed = this.data.speed;
    this.range = this.data.range;
    this.damage = this.data.damage;
    this.attackSpeed = this.data.attackSpeed;

    this.state = 'SEEK_TARGET'; // SEEK_TARGET | MOVE | ATTACK | DEAD
    this.targetBuilding = null;
    this.targetWall = null;
    this.path = [];
    this.attackCooldown = 0;
    this.attackAnimTimer = 0;
  }

  update(dt, battleManager) {
    if (this.hp <= 0) {
      this.state = 'DEAD';
      return;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= dt;
    }

    switch (this.state) {
      case 'SEEK_TARGET':
        this.findBestTarget(battleManager);
        break;

      case 'MOVE':
        this.moveAlongPath(dt, battleManager);
        break;

      case 'ATTACK':
        this.performAttack(dt, battleManager);
        break;
    }
  }

  findBestTarget(battleManager) {
    const activeBuildings = battleManager.buildings.filter(b => b.hp > 0);
    if (activeBuildings.length === 0) {
      this.targetBuilding = null;
      this.state = 'IDLE';
      return;
    }

    let candidates = activeBuildings;

    // Filter by troop target priority
    if (this.data.targetPriority === 'defense') {
      const defenses = activeBuildings.filter(b => b.isDefense);
      if (defenses.length > 0) candidates = defenses;
    } else if (this.data.targetPriority === 'resource') {
      const resources = activeBuildings.filter(b => b.isResource);
      if (resources.length > 0) candidates = resources;
    } else if (this.data.targetPriority === 'wall') {
      const activeWalls = battleManager.walls.filter(w => w.hp > 0);
      if (activeWalls.length > 0) {
        // Find closest wall
        let closestWall = null;
        let minDist = Infinity;
        for (const w of activeWalls) {
          const d = Math.hypot(w.x + 0.5 - this.x, w.y + 0.5 - this.y);
          if (d < minDist) {
            minDist = d;
            closestWall = w;
          }
        }
        this.targetWall = closestWall;
        this.targetBuilding = null;
        this.path = battleManager.pathfinder.findPath(this.x, this.y, closestWall.x + 0.5, closestWall.y + 0.5, false);
        this.state = 'MOVE';
        return;
      }
    }

    // Find closest candidate
    let bestTarget = null;
    let shortestDist = Infinity;

    for (const b of candidates) {
      const center = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      const dist = Math.hypot(center.x - this.x, center.y - this.y);
      if (dist < shortestDist) {
        shortestDist = dist;
        bestTarget = b;
      }
    }

    if (bestTarget) {
      this.targetBuilding = bestTarget;
      this.targetWall = null;
      const targetPos = { x: bestTarget.x + bestTarget.width / 2, y: bestTarget.y + bestTarget.height / 2 };

      // Calculate path
      this.path = battleManager.pathfinder.findPath(this.x, this.y, targetPos.x, targetPos.y, true);
      this.state = 'MOVE';
    }
  }

  moveAlongPath(dt, battleManager) {
    const target = this.targetBuilding || this.targetWall;
    if (!target || target.hp <= 0) {
      this.state = 'SEEK_TARGET';
      return;
    }

    // Check if within attack range of target
    const targetCenter = {
      x: target.x + (target.width || 1) / 2,
      y: target.y + (target.height || 1) / 2
    };
    const distToTarget = Math.hypot(targetCenter.x - this.x, targetCenter.y - this.y);

    if (distToTarget <= this.range + (target.width ? target.width / 2 : 0.5)) {
      this.state = 'ATTACK';
      return;
    }

    // Advance along path
    if (this.path && this.path.length > 0) {
      const nextNode = this.path[0];
      const dx = nextNode.x - this.x;
      const dy = nextNode.y - this.y;
      const stepDist = Math.hypot(dx, dy);

      const moveStep = this.speed * dt;
      if (stepDist <= moveStep) {
        this.x = nextNode.x;
        this.y = nextNode.y;
        this.path.shift();
      } else {
        this.x += (dx / stepDist) * moveStep;
        this.y += (dy / stepDist) * moveStep;
      }
    } else {
      // Path exhausted, re-evaluate
      this.state = 'SEEK_TARGET';
    }
  }

  performAttack(dt, battleManager) {
    const target = this.targetBuilding || this.targetWall;
    if (!target || target.hp <= 0) {
      this.state = 'SEEK_TARGET';
      return;
    }

    if (this.attackCooldown <= 0) {
      this.attackCooldown = this.attackSpeed;
      this.attackAnimTimer = 0.25;

      let dmg = this.damage;
      if (this.data.resourceMultiplier && target.isResource) {
        dmg *= this.data.resourceMultiplier;
      }
      if (this.data.wallMultiplier && target.isWall) {
        dmg *= this.data.wallMultiplier;
      }

      if (this.data.range > 1.5) {
        // Ranged projectile
        battleManager.projectileEngine.createTroopProjectile(
          this,
          target,
          this.type === 'WIZARD' ? 'FIREBALL' : 'ARROW',
          dmg,
          this.data.splashRadius
        );
      } else {
        // Direct melee attack
        target.hp -= dmg;
        battleManager.addDamageText(target.x + (target.width || 1) / 2, target.y, `-${Math.round(dmg)}`, '#ef4444');
        battleManager.renderer.addParticle(this.x, this.y, this.data.color, 4, 30, 0.3);

        if (this.data.isSuicide) {
          // Suicide bomber explosion
          this.hp = 0;
          this.state = 'DEAD';
          battleManager.renderer.addParticle(this.x, this.y, '#f97316', 20, 80, 0.6);
        }
      }

      if (target.hp <= 0) {
        target.hp = 0;
        this.state = 'SEEK_TARGET';
      }
    }
  }
}
