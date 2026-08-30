/**
 * Canvas Renderer Engine
 * High-performance, high-DPI rendering with glow effects, particle systems, and dynamic laser ray paths.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.particles = [];
    this.animTime = 0;

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
      grid: 'rgba(0, 240, 255, 0.07)',
      gridSub: 'rgba(255, 255, 255, 0.03)',
      wall: '#1e2436',
      wallBorder: '#3b4566',
      plate: '#252e47',
      doorOpen: 'rgba(0, 255, 102, 0.2)',
      doorClosed: 'rgba(255, 0, 85, 0.7)'
    };

    this.setupResizeHandler();
  }

  setupResizeHandler() {
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width - 20, rect.height - 20, 800);
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

  update(dt) {
    this.animTime += dt;

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

  addParticle(x, y, color = '#00f0ff', count = 1, speed = 40, maxLife = 0.6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
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
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw cybernetic grid background
  drawGrid(gridSize, cols, rows, offsetX, offsetY) {
    const ctx = this.ctx;
    ctx.save();

    // Subtle dark background panel
    ctx.fillStyle = '#0d101a';
    ctx.fillRect(offsetX, offsetY, cols * gridSize, rows * gridSize);

    // Grid lines
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

    // Grid border
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, cols * gridSize, rows * gridSize);

    // Subtle coordinate dots
    ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.arc(offsetX + c * gridSize, offsetY + r * gridSize, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Draw Laser Ray Segment with dynamic glowing aura
  drawLaser(startX, startY, endX, endY, colorName = 'cyan') {
    const ctx = this.ctx;
    const color = this.colors[colorName] || colorName;

    ctx.save();
    ctx.lineCap = 'round';

    // Outer aura
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.35 + 0.15 * Math.sin(this.animTime * 8);
    ctx.lineWidth = 8;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Inner bright core
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // White center filament
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Laser Emitter
  drawEmitter(x, y, size, dir, colorName = 'cyan') {
    const ctx = this.ctx;
    const color = this.colors[colorName] || colorName;
    const r = size * 0.38;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(dir * (Math.PI / 2));

    // Base body
    ctx.fillStyle = '#1b2234';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cannon nozzle pointing right (dir=0)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(r * 0.4, -r * 0.35, r * 0.75, r * 0.7);
    ctx.fill();

    // Glowing core crystal
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Laser Receptor / Target Node
  drawReceptor(x, y, size, targetColor = 'cyan', isPowered = false) {
    const ctx = this.ctx;
    const color = this.colors[targetColor] || targetColor;
    const r = size * 0.4;

    ctx.save();
    ctx.translate(x, y);

    // Outer receptor housing
    ctx.fillStyle = '#141824';
    ctx.strokeStyle = isPowered ? color : '#3d4866';
    ctx.lineWidth = isPowered ? 3 : 2;
    if (isPowered) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
    }
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Target color ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Center power state
    if (isPowered) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing center core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.25 * (1 + 0.2 * Math.sin(this.animTime * 10)), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#22293d';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Flat Mirror with reflective crystal bar
  drawMirror(x, y, size, angle) {
    const ctx = this.ctx;
    const r = size * 0.42;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * (Math.PI / 180));

    // Base disc
    ctx.fillStyle = 'rgba(25, 32, 50, 0.7)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Reflective front bar
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, 0);
    ctx.lineTo(r * 0.85, 0);
    ctx.stroke();

    // Mirror back absorptive backing
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, 3.5);
    ctx.lineTo(r * 0.8, 3.5);
    ctx.stroke();

    // Mirror angle notch
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(0, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Beam Splitter / Prism
  drawSplitter(x, y, size, angle) {
    const ctx = this.ctx;
    const r = size * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * (Math.PI / 180));

    // Prism diamond shape
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Internal semi-reflective cross
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, 0);
    ctx.lineTo(r * 0.7, 0);
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(0, r * 0.7);
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
    ctx.globalAlpha = 0.3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillRect(-r * 0.8, -r * 0.3, r * 1.6, r * 0.6);

    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-r * 0.8, -r * 0.3, r * 1.6, r * 0.6);

    // Color marker
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(filterColor[0].toUpperCase(), 0, 0);

    ctx.restore();
  }

  // Draw Logic Gate (Optics Mode)
  drawLogicGate(x, y, size, type = 'AND', isSatisfied = false) {
    const ctx = this.ctx;
    const r = size * 0.4;
    const color = isSatisfied ? this.colors.green : this.colors.orange;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#141828';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    if (isSatisfied) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
    }
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type, 0, 0);

    ctx.restore();
  }

  // Draw Quantum Portal
  drawPortal(x, y, size, portalId = 1) {
    const ctx = this.ctx;
    const r = size * 0.4;
    const color = portalId % 2 === 1 ? '#00f0ff' : '#ff007f';

    ctx.save();
    ctx.translate(x, y);

    // Swirling portal rings
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(0, 0, r * (0.8 + 0.1 * Math.sin(this.animTime * 4)), 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, this.animTime * 3, this.animTime * 3 + Math.PI * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`P${portalId}`, 0, 0);

    ctx.restore();
  }

  // Draw Metallic Cyber Blocker / Obstacle
  drawBlocker(x, y, size) {
    const ctx = this.ctx;
    const r = size * 0.45;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#181d2a';
    ctx.strokeStyle = '#2d374e';
    ctx.lineWidth = 2;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    // Cyber diagonal hazard stripes
    ctx.strokeStyle = '#262f44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r, -r);
    ctx.lineTo(r, r);
    ctx.moveTo(-r, 0);
    ctx.lineTo(0, r);
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.stroke();

    ctx.restore();
  }

  // CHRONO MODE RENDERERS:
  // Draw Pressure Plate
  drawPressurePlate(x, y, size, isPressed = false) {
    const ctx = this.ctx;
    const r = size * 0.4;
    const color = isPressed ? '#00ff66' : '#00f0ff';

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = isPressed ? 'rgba(0, 255, 102, 0.25)' : '#192033';
    ctx.strokeStyle = color;
    ctx.lineWidth = isPressed ? 2.5 : 1.5;
    if (isPressed) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
    }
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    // Inner switch icon
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Security Gate / Door
  drawDoor(x, y, size, isOpen = false) {
    const ctx = this.ctx;
    const r = size * 0.45;

    ctx.save();
    ctx.translate(x, y);

    if (isOpen) {
      ctx.fillStyle = this.colors.doorOpen;
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 8;
      ctx.strokeRect(-r, -r, r * 2, r * 2);

      // Retracted gate lines
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.8);
      ctx.lineTo(-r * 0.4, -r * 0.8);
      ctx.moveTo(r * 0.4, -r * 0.8);
      ctx.lineTo(r, -r * 0.8);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#2b101c';
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.strokeRect(-r, -r, r * 2, r * 2);

      // Forcefield cross
      ctx.strokeStyle = 'rgba(255, 0, 85, 0.8)';
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.7);
      ctx.lineTo(r * 0.7, r * 0.7);
      ctx.moveTo(-r * 0.7, r * 0.7);
      ctx.lineTo(r * 0.7, -r * 0.7);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Pushable Battery / Weighted Cube
  drawBattery(x, y, size) {
    const ctx = this.ctx;
    const r = size * 0.38;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#1c2842';
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 8;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    // Battery bolt icon
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.moveTo(-2, -r * 0.6);
    ctx.lineTo(r * 0.4, -2);
    ctx.lineTo(0, 0);
    ctx.lineTo(2, r * 0.6);
    ctx.lineTo(-r * 0.4, 2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw Chrono Exit Portal
  drawExitPortal(x, y, size, isUnlocked = true) {
    const ctx = this.ctx;
    const r = size * 0.42;
    const color = isUnlocked ? '#00ff66' : '#ff0055';

    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    if (isUnlocked) {
      ctx.fillStyle = 'rgba(0, 255, 102, 0.2)';
      ctx.fill();

      // Swirl vortex
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.6, this.animTime * 4, this.animTime * 4 + Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Player Avatar
  drawPlayer(x, y, size, isGhost = false, ghostIndex = 0) {
    const ctx = this.ctx;
    const r = size * 0.38;
    const color = isGhost ? (ghostIndex === 0 ? '#9d00ff' : '#ff007f') : '#00f0ff';

    ctx.save();
    ctx.translate(x, y);

    if (isGhost) {
      ctx.globalAlpha = 0.65;
    }

    // Outer glow aura
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isGhost ? 10 : 18;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Direction/Status marker
    if (isGhost) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`T${ghostIndex + 1}`, 0, 0);
    }

    ctx.restore();
  }
}
