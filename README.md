# 🧠 SYNAPSE: The Neuro-Logic Matrix

> A mind-bending quantum logic, time-loop paradox, and boolean puzzle game.

[![Deploy to GitHub Pages](https://github.com/actions/workflows/deploy.yml/badge.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)](index.html)

---

## 🌌 Overview

**SYNAPSE** is a multi-modal cognitive puzzle game built to challenge spatial reasoning, temporal planning, and deductive logic. It features three distinct puzzle mechanics, an endless daily cognitive challenge with Cognitive Quotient (CQ) rating, and a live level studio.

```
          ┌──────────────────────────────────────────┐
          │   Ψ  S Y N A P S E  M A T R I X          │
          │                                          │
   ⚡ ───▶│───[ 45° ]───▶ [ Splitter ] ───▶ [Core A] │
          │                 │                        │
          │                 ▼                        │
          │              [Filter] ───▶ [Core B]      │
          └──────────────────────────────────────────┘
```

---

## 🎮 Game Modes

### 1. ⚡ Quantum Beam Architect (Optics Mode)
- **Mechanics**: Route laser beams through mirrors, beam splitters, RGB wavelength filters, quantum teleportation portals, and boolean logic gates to power all quantum reactor nodes.
- **Interactions**: Drag & drop optical elements from the dock, tap/click to rotate reflection angles (45°, 135°, 225°, 315°), and isolate target frequencies.

### 2. ⏳ Chrono-Paradox (Time-Loop Clones Mode)
- **Mechanics**: A cooperative single-player temporal puzzle. Record your movements in Timeline $T_1$, trigger **Paradox Rewind** (`Spacebar`), and watch your past **Ghost Clone** repeat your previous steps to hold pressure switches and open security gates while you navigate new corridors in parallel.

### 3. 🧠 Synaptic Cipher (Boolean Circuit Mode)
- **Mechanics**: Deduce binary signals through networks of `AND`, `OR`, `XOR`, `NAND`, `NOR`, and `NOT` logic gates with real-time waveform visualization. Satisfy multiple target constraints with optimal test vectors.

### 4. 🏆 Daily Cognitive Gauntlet
- A deterministic daily 3-stage challenge combining all puzzle disciplines.
- Calculates your **Cognitive Quotient (CQ)** score (100–160) and tracks consecutive daily streaks.

### 5. 🛠️ Level Studio & Share Codes
- Build custom puzzle layouts, test them live in the sandbox engine, and export/import shareable Base64 level strings.

---

## ⌨️ Controls & Shortcuts

| Action | Control (Desktop) | Touch / Mobile |
| :--- | :--- | :--- |
| **Move Agent (Chrono)** | `W` `A` `S` `D` / `Arrow Keys` | Tap / Swipe |
| **Paradox Loop (Rewind)** | `Spacebar` | ⏳ Button |
| **Rotate Optical Piece** | Right-Click / `R` Key | Tap placed piece |
| **Undo Move** | `Z` / `Ctrl + Z` | ↶ Button |
| **Restart Level** | `R` Key | 🔄 Button |
| **Tactical Intel / Hints** | `H` Key | 💡 Button |
| **Toggle Audio** | `M` Key | 🔊 Button |
| **Sector Map** | `Esc` Key | 🗺️ Button |

---

## 🚀 Quick Start & Local Play

Because SYNAPSE is engineered using pure modern standards (HTML5 Canvas, ES6 Modules, Modern CSS with Glassmorphism, and the Web Audio API), **no build step or package manager is required**:

1. Clone or download the repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd game
   ```
2. Open `index.html` directly in any modern web browser:
   - Or run a local HTTP server:
     ```bash
     npx serve .
     # or
     python -m http.server 8000
     ```
3. Navigate to `http://localhost:8000`.

---

## 🛠️ Tech Architecture

- **Rendering**: Canvas 2D engine with device-pixel-ratio scaling, glowing laser raycaster, and particle collision dynamics.
- **Audio Engine**: 100% procedural Web Audio synthesizer (zero external mp3/wav files).
- **UI System**: Semantic HTML with native `<dialog closedby="any">` modal controls and responsive glassmorphic HUD.
- **Persistence**: `localStorage` state management for star ratings, move efficiency, best times, and daily streaks.
- **CI/CD**: GitHub Actions workflow (`.github/workflows/deploy.yml`) for instantaneous 1-click GitHub Pages deployment.

---

## 📜 License

MIT License — see the [LICENSE](LICENSE) file for details.
