/**
 * Advanced Canvas Renderer Engine
 * Features volumetric laser optics, animated energy packets, glass crystal rendering, dynamic glow, and particle shockwaves.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.particles = [];
    this.animTime = 0;
    this.screenShake = 0;

    // Color definitions
    this.colors = {
      cyan: '#00f0ff',
      magenta: '#ff007f',
      yellow: '#ffea00',
      green: '#00ff66',
      blue: '#0066ff',
      red: '#ff2244',
      purple: '#aa00ff',
      orange: '#ff7700',
      white: '#ffffff',
      grid: 'rgba(0, 240, 255, 0.08)',
      gridDot: 'rgba(0, 240, 255, 0.35)',
      wall: '#191f32',
      wallBorder: '#354366'
    };

    this.setupResizeHandler();
  }

  setupResizeHandler() {
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width - 20, rect.height - 20, 840);
    const canvasSize = Math.max(320, size);

    this.canvas.width = canvasSize * this.dpr;
    this.canvas.height = canvasSize * this.dpr;
    this.canvas.style.width = `${canvasSize}px`;
    this.canvas.style.height = `${canvasSize}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.width = canvasSize;
    this.height = canvasSize;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  triggerShake(intensity = 6) {
    this.screenShake = intensity;
  }

  update(dt) {
    this.animTime += dt;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 15);
    }

    // Update particles
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

  addParticle(x, y, color = '#00f0ff', count = 1, speed = 50, maxLife = 0.6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.75 + 0.25) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 3 + 1.5,
        life: maxLife * (Math.random() * 0.4 + 0.8),
        maxLife: maxLife,
        alpha: 1
      });
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw Cyber Grid with glowing intersections and subtle depth
  drawGrid(gridSize, cols, rows, offsetX, offsetY, hoverCell = null) {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake offset
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake * 2;
      const sy = (Math.random() - 0.5) * this.screenShake * 2;
      ctx.translate(sx, sy);
    }

    // Grid Floor
    ctx.fillStyle = '#0b0e17';
    ctx.fillRect(offsetX, offsetY, cols * gridSize, rows * gridSize);

    // Subtle checkerboard depth
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
          ctx.fillRect(offsetX + c * gridSize, offsetY + r * gridSize, gridSize, gridSize);
        }
      }
    }

    // Grid Lines
    ctx.strokeStyle = this.colors.grid;
    ctx.lineWidth = 1;

    for (let c = 0; c <= cols; c++) {
      const x = offsetX + c * gridSize;
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + rows * gridSize);
      ctx.stroke();
    }

    for (let r = 0; r <= rows; r++) {
      const y = offsetY + r * gridSize;
      ctx.beginPath();
      ctx.moveTo(offsetX, y);
      ctx.lineTo(offsetX + cols * gridSize, y);
      ctx.stroke();
    }

    // Outer Border with Neon Edge Glow
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.strokeRect(offsetX, offsetY, cols * gridSize, rows * gridSize);
    ctx.shadowBlur = 0;

    // Coordinate Dots
    ctx.fillStyle = this.colors.gridDot;
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.arc(offsetX + c * gridSize, offsetY + r * gridSize, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Highlight Hovered Cell with Magnetic Snap Bracket
    if (hoverCell && hoverCell.x >= 0 && hoverCell.x < cols && hoverCell.y >= 0 && hoverCell.y < rows) {
      const hx = offsetX + hoverCell.x * gridSize;
      const hy = offsetY + hoverCell.y * gridSize;

      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.fillRect(hx, hy, gridSize, gridSize);

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;

      // Corner brackets
      const bLen = gridSize * 0.25;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(hx, hy + bLen); ctx.lineTo(hx, hy); ctx.lineTo(hx + bLen, hy);
      // Top-Right
      ctx.moveTo(hx + gridSize - bLen, hy); ctx.lineTo(hx + gridSize, hy); ctx.lineTo(hx + gridSize, hy + bLen);
      // Bottom-Right
      ctx.moveTo(hx + gridSize, hy + gridSize - bLen); ctx.lineTo(hx + gridSize, hy + gridSize); ctx.lineTo(hx + gridSize - bLen, hy + gridSize);
      // Bottom-Left
      ctx.moveTo(hx + bLen, hy + gridSize); ctx.lineTo(hx, hy + gridSize); ctx.lineTo(hx, hy + gridSize - bLen);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Animated Volumetric Laser with Fast Flowing Energy Photons
  drawLaser(startX, startY, endX, endY, colorName = 'cyan') {
    const ctx = this.ctx;
    const color = this.colors[colorName] || colorName;

    ctx.save();
    ctx.lineCap = 'round';

    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0) return;

    // 1. Broad soft ambient glow
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.25 + 0.08 * Math.sin(this.animTime * 12);
    ctx.lineWidth = 12;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 2. Focused vibrant core beam
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 3. Ultra-bright white core center
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 1.6;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 4. Flowing Energy Photon Packets travelling along beam
    const speed = 250; // pixels per second
    const photonSpacing = 40;
    const offset = (this.animTime * speed) % photonSpacing;

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 1;

    for (let d = offset; d < dist; d += photonSpacing) {
      const px = startX + (dx / dist) * d;
      const py = startY + (dy / dist) * d;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Laser Cannon Emitter
  drawEmitter(x, y, size, dir, colorName = 'cyan') {
    const ctx = this.ctx;
    const color = this.colors[colorName] || colorName;
    const r = size * 0.38;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(dir * (Math.PI / 2));

    // Base body
    ctx.fillStyle = '#161d2d';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cannon Nozzle with glowing gradient
    const grad = ctx.createLinearGradient(0, 0, r * 1.2, 0);
    grad.addColorStop(0, '#161d2d');
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fillRect(r * 0.3, -r * 0.35, r * 0.8, r * 0.7);

    // Glowing core crystal
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45 * (0.9 + 0.1 * Math.sin(this.animTime * 10)), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Target Receptor Node with pulsating power rings
  drawReceptor(x, y, size, targetColor = 'cyan', isPowered = false) {
    const ctx = this.ctx;
    const color = this.colors[targetColor] || targetColor;
    const r = size * 0.4;

    ctx.save();
    ctx.translate(x, y);

    // Base chamber
    ctx.fillStyle = '#111522';
    ctx.strokeStyle = isPowered ? color : '#323c54';
    ctx.lineWidth = isPowered ? 3.5 : 2;
    if (isPowered) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 24;
    }
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Target color ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    if (isPowered) {
      // Spinning electric aura
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, this.animTime * 6, this.animTime * 6 + Math.PI);
      ctx.stroke();

      // Glowing solid core
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.48, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.28 * (1 + 0.2 * Math.sin(this.animTime * 15)), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#1c2438';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Crystalline Mirror with metallic reflection and directional bevel
  drawMirror(x, y, size, angle) {
    const ctx = this.ctx;
    const r = size * 0.42;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * (Math.PI / 180));

    // Base Glass Disc
    ctx.fillStyle = 'rgba(20, 28, 48, 0.8)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Reflective Silvered Front Bar
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, 0);
    ctx.lineTo(r * 0.85, 0);
    ctx.stroke();

    // High-tech Absorptive Backing
    ctx.strokeStyle = '#3e4a66';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, 3.5);
    ctx.lineTo(r * 0.8, 3.5);
    ctx.stroke();

    // Direction notch
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(0, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Prism Splitter
  drawSplitter(x, y, size, angle) {
    const ctx = this.ctx;
    const r = size * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * (Math.PI / 180));

    // Refractive Diamond
    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Internal Prismatic Cross
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, 0);
    ctx.lineTo(r * 0.65, 0);
    ctx.moveTo(0, -r * 0.65);
    ctx.lineTo(0, r * 0.65);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Color Filter Slab
  drawFilter(x, y, size, angle, filterColor = 'cyan') {
    const ctx = this.ctx;
    const color = this.colors[filterColor] || filterColor;
    const r = size * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * (Math.PI / 180));

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillRect(-r * 0.85, -r * 0.35, r * 1.7, r * 0.7);

    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-r * 0.85, -r * 0.35, r * 1.7, r * 0.7);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(filterColor[0].toUpperCase(), 0, 0);

    ctx.restore();
  }

  // Draw Quantum Portal
  drawPortal(x, y, size, portalId = 1) {
    const ctx = this.ctx;
    const r = size * 0.4;
    const color = portalId % 2 === 1 ? '#00f0ff' : '#ff007f';

    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(0, 0, r * (0.85 + 0.1 * Math.sin(this.animTime * 5)), 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, this.animTime * 4, this.animTime * 4 + Math.PI * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`P${portalId}`, 0, 0);

    ctx.restore();
  }

  // Draw Cyber Obstacle Wall
  drawBlocker(x, y, size) {
    const ctx = this.ctx;
    const r = size * 0.45;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = this.colors.wall;
    ctx.strokeStyle = this.colors.wallBorder;
    ctx.lineWidth = 2;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    // Hazard Stripes
    ctx.strokeStyle = '#28334d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r, -r); ctx.lineTo(r, r);
    ctx.moveTo(-r, 0); ctx.lineTo(0, r);
    ctx.moveTo(0, -r); ctx.lineTo(r, 0);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Pressure Plate
  drawPressurePlate(x, y, size, isPressed = false) {
    const ctx = this.ctx;
    const r = size * 0.4;
    const color = isPressed ? '#00ff66' : '#00f0ff';

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = isPressed ? 'rgba(0, 255, 102, 0.3)' : '#192238';
    ctx.strokeStyle = color;
    ctx.lineWidth = isPressed ? 3 : 2;
    if (isPressed) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
    }
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Security Door Gate
  drawDoor(x, y, size, isOpen = false) {
    const ctx = this.ctx;
    const r = size * 0.45;

    ctx.save();
    ctx.translate(x, y);

    if (isOpen) {
      ctx.fillStyle = 'rgba(0, 255, 102, 0.18)';
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 10;
      ctx.strokeRect(-r, -r, r * 2, r * 2);
    } else {
      ctx.fillStyle = '#2b101c';
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 14;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.strokeRect(-r, -r, r * 2, r * 2);

      // Forcefield cross
      ctx.strokeStyle = 'rgba(255, 0, 85, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.7); ctx.lineTo(r * 0.7, r * 0.7);
      ctx.moveTo(-r * 0.7, r * 0.7); ctx.lineTo(r * 0.7, -r * 0.7);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Energy Battery Cube
  drawBattery(x, y, size) {
    const ctx = this.ctx;
    const r = size * 0.38;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#1c2842';
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 10;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.moveTo(-2, -r * 0.6); ctx.lineTo(r * 0.4, -2); ctx.lineTo(0, 0);
    ctx.lineTo(2, r * 0.6); ctx.lineTo(-r * 0.4, 2); ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw Exit Portal
  drawExitPortal(x, y, size, isUnlocked = true) {
    const ctx = this.ctx;
    const r = size * 0.42;
    const color = isUnlocked ? '#00ff66' : '#ff0055';

    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    if (isUnlocked) {
      ctx.fillStyle = 'rgba(0, 255, 102, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, this.animTime * 5, this.animTime * 5 + Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Live Player / Ghost Clones
  drawPlayer(x, y, size, isGhost = false, ghostIndex = 0) {
    const ctx = this.ctx;
    const r = size * 0.38;
    const color = isGhost ? (ghostIndex === 0 ? '#9d00ff' : '#ff007f') : '#00f0ff';

    ctx.save();
    ctx.translate(x, y);

    if (isGhost) {
      ctx.globalAlpha = 0.7;
    }

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isGhost ? 12 : 20;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    if (isGhost) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`T${ghostIndex + 1}`, 0, 0);
    }

    ctx.restore();
  }

  // Draw Logic Gate for Cipher Mode
  drawLogicGate(x, y, size, type = 'AND', isSatisfied = false) {
    const ctx = this.ctx;
    const r = size * 0.45;
    const color = isSatisfied ? this.colors.green : this.colors.orange;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#141a2c';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    if (isSatisfied) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
    }
    ctx.fillRect(-r, -r * 0.8, r * 2, r * 1.6);
    ctx.strokeRect(-r, -r * 0.8, r * 2, r * 1.6);

    ctx.fillStyle = color;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type, 0, 0);

    ctx.restore();
  }
}
