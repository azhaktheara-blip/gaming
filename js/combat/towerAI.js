/**
 * Defensive Tower Behavioral AI
 * Manages target acquisition, tracking, range checks, and projectile generation.
 */

export class DefensiveTower {
  constructor(buildingData) {
    this.building = buildingData;
    this.x = buildingData.x;
    this.y = buildingData.y;
    this.width = buildingData.width;
    this.height = buildingData.height;
    this.type = buildingData.type;
    this.stats = buildingData;

    this.cooldown = 0;
    this.target = null;
    this.rotation = 0; // Current barrel/aim angle in radians
  }

  get center() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  update(dt, battleManager) {
    if (this.building.hp <= 0) return;

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }

    // Acquire or maintain target
    if (!this.target || this.target.hp <= 0 || !this.isInRange(this.target)) {
      this.target = this.findTarget(battleManager);
    }

    if (this.target) {
      // Rotate towards target
      const dx = this.target.x - this.center.x;
      const dy = this.target.y - this.center.y;
      this.rotation = Math.atan2(dy, dx);

      // Fire projectile when off cooldown
      if (this.cooldown <= 0) {
        this.fire(battleManager);
      }
    }
  }

  isInRange(target) {
    const dist = Math.hypot(target.x - this.center.x, target.y - this.center.y);
    if (this.stats.minRange && dist < this.stats.minRange) return false;
    return dist <= this.stats.range;
  }

  findTarget(battleManager) {
    const activeTroops = battleManager.troops.filter(t => t.hp > 0 && this.isInRange(t));
    if (activeTroops.length === 0) return null;

    // Find closest troop in range
    let closest = null;
    let minDist = Infinity;

    for (const t of activeTroops) {
      const dist = Math.hypot(t.x - this.center.x, t.y - this.center.y);
      if (dist < minDist) {
        minDist = dist;
        closest = t;
      }
    }

    return closest;
  }

  fire(battleManager) {
    if (!this.target) return;

    this.cooldown = this.stats.attackSpeed || 1.0;

    let projType = 'CANNONBALL';
    if (this.type === 'archer_tower') projType = 'ARROW';
    else if (this.type === 'mortar') projType = 'MORTAR_SHELL';
    else if (this.type === 'wizard_tower') projType = 'MAGIC_FIREBALL';

    battleManager.projectileEngine.createTowerProjectile(
      this,
      this.target,
      projType,
      this.stats.damage,
      this.stats.splashRadius
    );
  }
}
