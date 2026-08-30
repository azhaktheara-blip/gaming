/**
 * Isometric 2.5D Canvas Rendering Engine
 * Depth-sorted rendering for village buildings, defensive artillery, animated troop sprites, and parabolic projectiles.
 */

export class IsometricRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.animTime = 0;
    this.screenShake = 0;
    this.particles = [];

    // Isometric Tile Dimensions
    this.tileWidth = 44;
    this.tileHeight = 22;

    this.setupResize();
  }

  setupResize() {
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.width = w;
    this.height = h;
  }

  triggerShake(intensity = 6) {
    this.screenShake = intensity;
  }

  gridToScreen(gx, gy, gridSize = 34) {
    const originX = this.width / 2;
    const originY = 120;

    const sx = (gx - gy) * (this.tileWidth / 2) + originX;
    const sy = (gx + gy) * (this.tileHeight / 2) + originY;
    return { x: sx, y: sy };
  }

  screenToGrid(sx, sy, gridSize = 34) {
    const originX = this.width / 2;
    const originY = 120;

    const relX = sx - originX;
    const relY = sy - originY;

    const gx = (relX / (this.tileWidth / 2) + relY / (this.tileHeight / 2)) / 2;
    const gy = (relY / (this.tileHeight / 2) - relX / (this.tileWidth / 2)) / 2;
    return { gx, gy };
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  update(dt) {
    this.animTime += dt;
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 15);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  addParticle(gx, gy, color = '#f59e0b', count = 1, speed = 40, maxLife = 0.5) {
    const pos = this.gridToScreen(gx, gy);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 3 + 2,
        life: maxLife * (Math.random() * 0.4 + 0.8),
        maxLife,
        alpha: 1
      });
    }
  }

  // Draw Isometric Grass Field & Red Deployment Boundary
  drawTerrain(gridSize, deploymentExclusion = null, hoverGrid = null) {
    const ctx = this.ctx;
    ctx.save();

    if (this.screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * this.screenShake * 2, (Math.random() - 0.5) * this.screenShake * 2);
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const { x, y } = this.gridToScreen(c, r, gridSize);

        // Ground Tile Diamond
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + this.tileWidth / 2, y + this.tileHeight / 2);
        ctx.lineTo(x, y + this.tileHeight);
        ctx.lineTo(x - this.tileWidth / 2, y + this.tileHeight / 2);
        ctx.closePath();

        // Tile base colors
        if (deploymentExclusion && deploymentExclusion[r][c]) {
          // Red deployment exclusion area
          ctx.fillStyle = (r + c) % 2 === 0 ? '#382229' : '#301d24';
          ctx.fill();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Lush Green Village Grass
          ctx.fillStyle = (r + c) % 2 === 0 ? '#437c2d' : '#3d7228';
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Highlight hover tile
        if (hoverGrid && Math.floor(hoverGrid.gx) === c && Math.floor(hoverGrid.gy) === r) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  // Draw Building with Isometric Depth & Roof Details
  drawBuilding(b, isVillageMode = true) {
    if (b.hp <= 0) return;
    const ctx = this.ctx;
    const { x, y } = this.gridToScreen(b.x + b.width / 2, b.y + b.height / 2);

    const bWidth = b.width * (this.tileWidth / 2) * 1.6;
    const bHeight = b.height * (this.tileHeight / 2) * 1.6;
    const wallHeight = b.type === 'town_hall' ? 45 : b.type === 'archer_tower' ? 50 : 30;

    ctx.save();

    // 1. Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8, bWidth * 0.6, bHeight * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Building Foundation Block
    ctx.fillStyle = b.color || '#3b82f6';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    // Front Wall
    ctx.beginPath();
    ctx.moveTo(x - bWidth / 2, y);
    ctx.lineTo(x, y + bHeight / 2);
    ctx.lineTo(x, y + bHeight / 2 - wallHeight);
    ctx.lineTo(x - bWidth / 2, y - wallHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wall (Shaded)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.moveTo(x, y + bHeight / 2);
    ctx.lineTo(x + bWidth / 2, y);
    ctx.lineTo(x + bWidth / 2, y - wallHeight);
    ctx.lineTo(x, y + bHeight / 2 - wallHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Rooftop
    ctx.fillStyle = b.roofColor || '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(x, y - wallHeight - bHeight / 2);
    ctx.lineTo(x + bWidth / 2, y - wallHeight);
    ctx.lineTo(x, y - wallHeight + bHeight / 2);
    ctx.lineTo(x - bWidth / 2, y - wallHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Building Icon / Swiveling Barrels for defenses
    if (b.type === 'cannon') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x, y - wallHeight, 8, 0, Math.PI * 2);
      ctx.fill();
      // Cannon Barrel
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, y - wallHeight);
      ctx.lineTo(x + 12 * Math.cos(b.rotation || 0), y - wallHeight + 12 * Math.sin(b.rotation || 0));
      ctx.stroke();
    } else if (b.type === 'mortar') {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(x, y - wallHeight, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x, y - wallHeight, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.type === 'archer_tower') {
      // Archer on top
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(x, y - wallHeight - 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Floating Resource Bubble in Village Mode when full
    if (isVillageMode && b.accumulated && b.accumulated >= 50) {
      const bubbleY = y - wallHeight - 25 + Math.sin(this.animTime * 4) * 4;
      const bubbleIcon = b.type === 'gold_mine' ? '💰' : '🧪';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, bubbleY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bubbleIcon, x, bubbleY);
    }

    // 6. Health Bar if damaged in combat
    if (!isVillageMode && b.hp < b.maxHp) {
      this.drawHealthBar(x, y - wallHeight - 15, b.hp, b.maxHp, 40);
    }

    ctx.restore();
  }

  // Draw Stone Palisade Wall Block
  drawWall(w, isVillageMode = true) {
    if (w.hp <= 0) return;
    const ctx = this.ctx;
    const { x, y } = this.gridToScreen(w.x + 0.5, w.y + 0.5);
    const wallHeight = 18;

    ctx.save();

    // Wall Pillar
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x + 12, y);
    ctx.lineTo(x + 12, y - wallHeight);
    ctx.lineTo(x, y - wallHeight - 6);
    ctx.lineTo(x - 12, y - wallHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (!isVillageMode && w.hp < w.maxHp) {
      this.drawHealthBar(x, y - wallHeight - 8, w.hp, w.maxHp, 22);
    }

    ctx.restore();
  }

  // Draw Animated Troop Character
  drawTroop(troop) {
    if (troop.hp <= 0) return;
    const ctx = this.ctx;
    const { x, y } = this.gridToScreen(troop.x, troop.y);

    const stride = Math.sin(this.animTime * 12) * 3;
    const size = troop.type === 'giant' ? 14 : troop.type === 'goblin' ? 7 : 9;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, size * 0.9, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = troop.data.color || '#f59e0b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y - size + stride, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Troop Type Icon / Weapon
    ctx.font = `${Math.round(size * 1.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(troop.data.icon, x, y - size + stride);

    // Health Bar
    this.drawHealthBar(x, y - size * 2.2, troop.hp, troop.maxHp, size * 2.5);

    ctx.restore();
  }

  drawHealthBar(x, y, currentHp, maxHp, width = 30) {
    const ctx = this.ctx;
    const h = 4;
    const ratio = Math.max(0, Math.min(1, currentHp / maxHp));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - width / 2, y, width, h);

    ctx.fillStyle = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(x - width / 2, y, width * ratio, h);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, y, width, h);
  }

  // Draw Flying Projectiles
  drawProjectile(p) {
    const ctx = this.ctx;
    const start = this.gridToScreen(p.x, p.y);
    const altitudePx = (p.altitude || 0) * 35; // Vertical lift from arc

    ctx.save();

    if (p.maxArcHeight > 0) {
      // Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(start.x, start.y, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (p.type === 'MORTAR_SHELL') {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(start.x, start.y - altitudePx, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(start.x, start.y - altitudePx, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'ARROW') {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(start.x - 4, start.y - altitudePx);
      ctx.lineTo(start.x + 4, start.y - altitudePx);
      ctx.stroke();
    } else if (p.type === 'MAGIC_FIREBALL') {
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(start.x, start.y - altitudePx, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cannonball
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(start.x, start.y - altitudePx, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Floating Combat Damage & Loot Text
  drawDamageText(dtObj) {
    const ctx = this.ctx;
    const pos = this.gridToScreen(dtObj.x, dtObj.y);

    ctx.save();
    ctx.globalAlpha = Math.max(0, dtObj.life / dtObj.maxLife);
    ctx.fillStyle = dtObj.color;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(dtObj.text, pos.x, pos.y);
    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
