# ⚔️ REALM CLASH: 2D Tactical Kingdom & AI War

> A 2D strategic base builder and real-time tactical AI combat game inspired by *Clash of Clans*, built with modern web standards, A* pathfinding, specialized troop AI behaviors, and procedural Web Audio.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Dependencies: Zero](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)](index.html)

---

## 🏰 Game Overview

**Realm Clash** combines city building, passive resource economies, army training, and real-time AI raids:
1. **Home Village**: Construct and arrange Town Halls, Gold Mines, Elixir Collectors, Storages, Barracks, Army Camps, Cannons, Mortars, Archer Towers, and Palisade Walls.
2. **AI Combat & Raids**: Deploy specialized troops outside the enemy red defense zone to destroy AI-generated goblin fortresses and campaign strongholds.

```
                     ┌─────────────────────────────────────────┐
                     │          V I L L A G E   H U B          │
                     │  [Gold Mines]   [Elixir Vats]   [Camps] │
                     └────────────────────┬────────────────────┘
                                          │  Train Army & Attack
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │         A I   B A T T L E G R O U N D   │
                     │                                         │
 🏹 Archer (Range) ─▶│ ──▶ [WALL] ──▶ [Cannon] ◀── 🛡️ Giant    │
 💰 Goblin (Loot)   ─▶│ ──▶ [Gold Storage]      ◀── ⚔️ Barbarian│
 💣 Wall Breaker    ─▶│ ──▶ [Breach Point]      ◀── 🔮 Wizard   │
                     └─────────────────────────────────────────┘
```

---

## 🤖 Specialized Troop AI Behaviors

| Troop | Role | Target Priority | Combat Characteristics |
| :--- | :--- | :--- | :--- |
| **⚔️ Barbarian** | Swarm Melee | Any (Closest) | Balanced melee warrior; charges the nearest accessible structure. |
| **🏹 Archer** | Ranged Marksman | Any | Shoots arrows over walls from safe distances (Range 3.8 tiles). |
| **🛡️ Giant** | Heavy Tank | **Defenses Only** | Huge HP pool (750 HP); bypasses all other buildings to prioritize Cannons, Mortars, and Towers. |
| **💰 Goblin** | Resource Raider | **Resources Only** | Fast movement (4.0 tiles/sec); deals **$2\times$ damage** directly to Gold & Elixir Storages. |
| **💣 Wall Breaker** | Demolition Specialist | **Walls Only** | Seeks the nearest enclosed wall segment and detonates self for **$12\times$ wall damage**. |
| **🔮 Wizard** | Arcane Sorcerer | Any | High-damage ranged magic firestorms with area-of-effect splash damage. |

---

## 🛡️ Defensive Tower AI & Artillery Ballistics

- **💥 Cannon**: Rapid kinetic ground cannonballs targeting approaching melee troops.
- **🏹 Archer Tower**: Elevated long-range perimeter coverage targeting ground and air.
- **💣 Mortar**: Long-range ballistic artillery calculating true parabolic flight arcs with high-impact **Area-of-Effect (AoE) splash shockwaves**.
- **🔮 Wizard Tower**: Arcane fireballs dealing circular splash damage to swarms.
- **🧱 Palisade Walls**: Hard physical obstacles that funnel enemy troops and require breaching.

---

## 🎮 How to Play

### 1. Village Management
- **Collect Resources**: Click on glowing Gold Mines (`💰`) or Elixir Collectors (`🧪`) to collect accumulated wealth.
- **Shop / Build**: Open the **Shop** (`🛠️`) to place new defenses, resource buildings, or palisade walls.
- **Train Army**: Open **Train Army** (`⚔️`) to queue Barbarians, Archers, Giants, Goblins, Wall Breakers, and Wizards.

### 2. Campaign Raids & AI Combat
1. Click **ATTACK!** (`💥`) to scout an enemy goblin fortress.
2. Select a troop type from your bottom deployment deck.
3. Tap or click on any green grass tile **outside the red exclusion boundary** to deploy your units.
4. Watch your troops' behavioral AI navigate with A* pathfinding and attack enemy defenses!
5. Earn 1 to 3 stars based on destruction percentage and Town Hall elimination, and steal enemy Gold & Elixir back to your village!

---

## 🚀 Quick Start & Local Play

```bash
# Clone the repository
git clone https://github.com/azhaktheara-blip/gaming.git
cd game

# Run automated test suite
npm test

# Play locally
python -m http.server 8000
# or open index.html directly in any browser
```

---

## 📜 License

MIT License — see the [LICENSE](LICENSE) file for details.
