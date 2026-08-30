/**
 * Projectile Physics and Ballistics Engine
 * Handles linear shots (Arrows, Cannonballs), parabolic artillery arcs (Mortars), and AoE splash damage.
 */

export class ProjectileEngine {
  constructor(battleManager) {
    this.battleManager = battleManager;
    this.projectiles = [];
  }

  createTowerProjectile(tower, target, type, damage, splashRadius = 0) {
    const startPos = tower.center;
    const targetPos = { x: target.x, y: target.y };
    const dist = Math.hypot(targetPos.x - startPos.x, targetPos.y - startPos.y);

    const speed = type === 'MORTAR_SHELL' ? 3.5 : type === 'ARROW' ? 8.0 : 6.5;
    const duration = dist / speed;

    this.projectiles.push({
      id: Math.random(),
      isFromTower: true,
      type,
      startX: startPos.x,
      startY: startPos.y,
      x: startPos.x,
      y: startPos.y,
      targetX: targetPos.x,
      targetY: targetPos.y,
      targetEntity: target,
      progress: 0,
      duration,
      damage,
      splashRadius,
      maxArcHeight: type === 'MORTAR_SHELL' ? 2.5 : 0
    });
  }

  createTroopProjectile(troop, target, type, damage, splashRadius = 0) {
    const startPos = { x: troop.x, y: troop.y };
    const targetPos = {
      x: target.x + (target.width || 1) / 2,
      y: target.y + (target.height || 1) / 2
    };
    const dist = Math.hypot(targetPos.x - startPos.x, targetPos.y - startPos.y);

    const speed = 7.0;
    const duration = dist / speed;

    this.projectiles.push({
      id: Math.random(),
      isFromTower: false,
      type,
      startX: startPos.x,
      startY: startPos.y,
      x: startPos.x,
      y: startPos.y,
      targetX: targetPos.x,
      targetY: targetPos.y,
      targetEntity: target,
      progress: 0,
      duration,
      damage,
      splashRadius,
      maxArcHeight: 0
    });
  }

  update(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.progress += dt / p.duration;

      if (p.targetEntity && p.targetEntity.hp > 0 && p.type !== 'MORTAR_SHELL') {
        // Homing update for direct shots
        if (p.isFromTower) {
          p.targetX = p.targetEntity.x;
          p.targetY = p.targetEntity.y;
        }
      }

      // Linear interpolation for ground coordinates
      const t = Math.min(1, p.progress);
      p.x = p.startX + (p.targetX - p.startX) * t;
      p.y = p.startY + (p.targetY - p.startY) * t;

      // Parabolic Arc calculation for vertical altitude
      p.altitude = p.maxArcHeight > 0 ? 4 * p.maxArcHeight * t * (1 - t) : 0;

      // Check impact
      if (p.progress >= 1) {
        this.handleImpact(p);
        this.projectiles.splice(i, 1);
      }
    }
  }

  handleImpact(p) {
    const bm = this.battleManager;

    if (p.isFromTower) {
      // Tower projectile hit attacking troops
      if (p.splashRadius > 0) {
        // AoE splash attack (Mortar / Wizard Tower)
        const hitTroops = bm.troops.filter(
          t => t.hp > 0 && Math.hypot(t.x - p.targetX, t.y - p.targetY) <= p.splashRadius
        );

        hitTroops.forEach(t => {
          t.hp -= p.damage;
          bm.addDamageText(t.x, t.y, `-${Math.round(p.damage)}`, '#ef4444');
        });

        // Spawn ground shockwave explosion
        bm.renderer.addParticle(p.targetX, p.targetY, '#f97316', 25, 75, 0.6);
        bm.renderer.triggerShake(4);
      } else {
        // Single target
        if (p.targetEntity && p.targetEntity.hp > 0) {
          p.targetEntity.hp -= p.damage;
          bm.addDamageText(p.targetEntity.x, p.targetEntity.y, `-${Math.round(p.damage)}`, '#ef4444');
          bm.renderer.addParticle(p.targetX, p.targetY, '#f59e0b', 6, 30, 0.3);
        }
      }
    } else {
      // Troop projectile hit enemy building
      if (p.targetEntity && p.targetEntity.hp > 0) {
        if (p.splashRadius > 0) {
          p.targetEntity.hp -= p.damage;
          bm.addDamageText(p.targetX, p.targetY, `-${Math.round(p.damage)}`, '#a855f7');
          bm.renderer.addParticle(p.targetX, p.targetY, '#a855f7', 15, 60, 0.5);
        } else {
          p.targetEntity.hp -= p.damage;
          bm.addDamageText(p.targetX, p.targetY, `-${Math.round(p.damage)}`, '#ef4444');
          bm.renderer.addParticle(p.targetX, p.targetY, '#ec4899', 5, 25, 0.3);
        }

        if (p.targetEntity.hp <= 0) {
          p.targetEntity.hp = 0;
        }
      }
    }
  }
}
