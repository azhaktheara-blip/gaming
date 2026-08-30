/**
 * Quantum Optics Campaign Levels & Procedural Generator
 */

export const OPTICS_LEVELS = [
  {
    id: 1,
    title: 'Photon Alignment',
    difficulty: 'Novice',
    cols: 6,
    rows: 6,
    targetMoves: 2,
    hints: [
      'Place a mirror on the laser path to reflect it 90 degrees.',
      'Tap or right-click the placed mirror to change its reflection angle.',
      'Target is at (4, 4).'
    ],
    emitters: [{ x: 1, y: 1, dir: 0, color: 'cyan' }], // Right
    receptors: [{ x: 4, y: 4, color: 'cyan' }],
    inventory: [{ type: 'mirror', count: 2 }],
    fixedItems: []
  },
  {
    id: 2,
    title: 'Dual Reflection',
    difficulty: 'Novice',
    cols: 7,
    rows: 7,
    targetMoves: 4,
    hints: [
      'You need two mirrors to navigate around the center blocker.',
      'Reflect downwards first, then rightwards towards the receptor.'
    ],
    emitters: [{ x: 1, y: 2, dir: 0, color: 'cyan' }],
    receptors: [{ x: 5, y: 5, color: 'cyan' }],
    inventory: [{ type: 'mirror', count: 3 }],
    fixedItems: [
      { type: 'blocker', x: 3, y: 2 },
      { type: 'blocker', x: 3, y: 3 },
      { type: 'blocker', x: 3, y: 4 }
    ]
  },
  {
    id: 3,
    title: 'Beam Divergence',
    difficulty: 'Intermediate',
    cols: 7,
    rows: 7,
    targetMoves: 5,
    hints: [
      'Use the beam splitter to divide the single laser into two perpendicular paths.',
      'Direct one path to the top receptor and the other to the bottom receptor.'
    ],
    emitters: [{ x: 1, y: 3, dir: 0, color: 'magenta' }],
    receptors: [
      { x: 5, y: 1, color: 'magenta' },
      { x: 5, y: 5, color: 'magenta' }
    ],
    inventory: [
      { type: 'splitter', count: 1 },
      { type: 'mirror', count: 3 }
    ],
    fixedItems: []
  },
  {
    id: 4,
    title: 'Chromatic Separation',
    difficulty: 'Intermediate',
    cols: 8,
    rows: 8,
    targetMoves: 6,
    hints: [
      'The white laser can be split and filtered into distinct frequencies.',
      'Cyan filter passes Blue & Green; Magenta filter passes Red & Blue.',
      'Align the filtered beams to the matching receptor cores.'
    ],
    emitters: [{ x: 1, y: 3, dir: 0, color: 'white' }],
    receptors: [
      { x: 6, y: 1, color: 'cyan' },
      { x: 6, y: 6, color: 'magenta' }
    ],
    inventory: [
      { type: 'splitter', count: 1 },
      { type: 'filter', filterColor: 'cyan', count: 1 },
      { type: 'filter', filterColor: 'magenta', count: 1 },
      { type: 'mirror', count: 4 }
    ],
    fixedItems: [
      { type: 'blocker', x: 4, y: 3 }
    ]
  },
  {
    id: 5,
    title: 'Quantum Wormhole',
    difficulty: 'Advanced',
    cols: 8,
    rows: 8,
    targetMoves: 6,
    hints: [
      'Portals instantly teleport light beams across the matrix.',
      'Direct the beam into portal P1 to bypass the central fortress.'
    ],
    emitters: [{ x: 1, y: 1, dir: 1, color: 'yellow' }], // Downwards
    receptors: [{ x: 6, y: 6, color: 'yellow' }],
    inventory: [
      { type: 'mirror', count: 4 }
    ],
    fixedItems: [
      { type: 'portal', portalId: 1, x: 1, y: 5 },
      { type: 'portal', portalId: 1, x: 4, y: 2 },
      { type: 'blocker', x: 3, y: 3 },
      { type: 'blocker', x: 4, y: 3 },
      { type: 'blocker', x: 5, y: 3 }
    ]
  },
  {
    id: 6,
    title: 'Prism Cascade',
    difficulty: 'Advanced',
    cols: 8,
    rows: 8,
    targetMoves: 8,
    hints: [
      'Multiple beam splitters can distribute power to 3 separate receptors.',
      'Plan the order of reflections carefully before placing pieces.'
    ],
    emitters: [{ x: 0, y: 4, dir: 0, color: 'green' }],
    receptors: [
      { x: 4, y: 0, color: 'green' },
      { x: 7, y: 4, color: 'green' },
      { x: 4, y: 7, color: 'green' }
    ],
    inventory: [
      { type: 'splitter', count: 2 },
      { type: 'mirror', count: 4 }
    ],
    fixedItems: []
  },
  {
    id: 7,
    title: 'The Entanglement Maze',
    difficulty: 'Mastermind',
    cols: 9,
    rows: 9,
    targetMoves: 10,
    hints: [
      'Two laser sources of different colors must reach their respective targets.',
      'Avoid crossing paths that would occlude the secondary beam.'
    ],
    emitters: [
      { x: 1, y: 1, dir: 0, color: 'cyan' },
      { x: 7, y: 7, dir: 2, color: 'magenta' }
    ],
    receptors: [
      { x: 7, y: 1, color: 'cyan' },
      { x: 1, y: 7, color: 'magenta' }
    ],
    inventory: [
      { type: 'mirror', count: 6 }
    ],
    fixedItems: [
      { type: 'blocker', x: 4, y: 2 },
      { type: 'blocker', x: 4, y: 4 },
      { type: 'blocker', x: 4, y: 6 }
    ]
  },
  {
    id: 8,
    title: 'Spectral Fusion',
    difficulty: 'Mastermind',
    cols: 9,
    rows: 9,
    targetMoves: 12,
    hints: [
      'Wormholes combined with dual splitters require 4 distinct path vectors.',
      'Use every mirror with optimal orientation.'
    ],
    emitters: [{ x: 0, y: 2, dir: 0, color: 'white' }],
    receptors: [
      { x: 8, y: 2, color: 'cyan' },
      { x: 2, y: 8, color: 'yellow' },
      { x: 8, y: 8, color: 'magenta' }
    ],
    inventory: [
      { type: 'splitter', count: 2 },
      { type: 'filter', filterColor: 'cyan', count: 1 },
      { type: 'filter', filterColor: 'yellow', count: 1 },
      { type: 'filter', filterColor: 'magenta', count: 1 },
      { type: 'mirror', count: 5 }
    ],
    fixedItems: [
      { type: 'portal', portalId: 1, x: 5, y: 2 },
      { type: 'portal', portalId: 1, x: 2, y: 5 }
    ]
  }
];

// Procedural Level Generator for Infinite Play
export function generateProceduralOpticsLevel(seed = Date.now(), difficulty = 'Normal') {
  const cols = difficulty === 'Hard' ? 9 : 8;
  const rows = difficulty === 'Hard' ? 9 : 8;
  const colors = ['cyan', 'magenta', 'yellow', 'green'];
  const color = colors[seed % colors.length];

  const emitterX = 1;
  const emitterY = 1 + (seed % 3);
  const receptorX = cols - 2;
  const receptorY = rows - 2 - (seed % 2);

  const mirrorCount = difficulty === 'Hard' ? 5 : 4;
  const hasSplitter = difficulty === 'Hard';

  const inventory = [{ type: 'mirror', count: mirrorCount }];
  if (hasSplitter) {
    inventory.push({ type: 'splitter', count: 1 });
  }

  const blockers = [];
  const blockerCount = 2 + (seed % 3);
  for (let i = 0; i < blockerCount; i++) {
    const bx = 3 + (i % 3);
    const by = 2 + ((seed + i) % 4);
    if ((bx !== emitterX || by !== emitterY) && (bx !== receptorX || by !== receptorY)) {
      blockers.push({ type: 'blocker', x: bx, y: by });
    }
  }

  return {
    id: `proc_${seed}`,
    title: `Quantum Matrix #${Math.abs(seed % 9999)}`,
    difficulty: difficulty,
    cols,
    rows,
    targetMoves: mirrorCount + 2,
    hints: [
      'Analyze the line of sight from the emitter to receptor.',
      'Position mirrors at 90-degree intersection points.'
    ],
    emitters: [{ x: emitterX, y: emitterY, dir: 0, color }],
    receptors: [{ x: receptorX, y: receptorY, color }],
    inventory,
    fixedItems: blockers
  };
}
