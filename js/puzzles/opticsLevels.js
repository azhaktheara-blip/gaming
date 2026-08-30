/**
 * Quantum Optics Campaign Levels & Procedural Generator
 * Handcrafted progression from intuitive optical fundamentals to mind-bending quantum puzzles.
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
      'Place a mirror on the laser trajectory at (4, 1).',
      'Tap the mirror to rotate its reflection angle until it points down to the cyan receptor at (4, 4).'
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
      'You need two mirrors to navigate around the central obstacle wall.',
      'Reflect downwards first at (4, 1), then reflect rightwards at (4, 5) towards the receptor.'
    ],
    emitters: [{ x: 1, y: 1, dir: 0, color: 'cyan' }],
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
      'Use the beam splitter to divide the single magenta laser into two separate paths.',
      'One beam goes straight while the reflected beam shoots perpendicular.'
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
      'The white laser contains all wavelengths.',
      'Split the white laser, then pass one through the Cyan filter and the other through Magenta.'
    ],
    emitters: [{ x: 1, y: 3, dir: 0, color: 'white' }],
    receptors: [
      { x: 6, y: 1, color: 'cyan' },
      { x: 6, y: 5, color: 'magenta' }
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
    title: 'Laser Crossroads',
    difficulty: 'Advanced',
    cols: 8,
    rows: 8,
    targetMoves: 8,
    hints: [
      'Two distinct laser beams must reach their corresponding colored cores without crossing into wrong paths.',
      'Direct Cyan along the perimeter and Magenta through the center.'
    ],
    emitters: [
      { x: 1, y: 1, dir: 0, color: 'cyan' },
      { x: 6, y: 6, dir: 2, color: 'magenta' }
    ],
    receptors: [
      { x: 6, y: 1, color: 'cyan' },
      { x: 1, y: 6, color: 'magenta' }
    ],
    inventory: [
      { type: 'mirror', count: 5 }
    ],
    fixedItems: [
      { type: 'blocker', x: 3, y: 3 },
      { type: 'blocker', x: 4, y: 4 }
    ]
  },
  {
    id: 8,
    title: 'Spectral Synthesis',
    difficulty: 'Mastermind',
    cols: 9,
    rows: 9,
    targetMoves: 10,
    hints: [
      'Split white light into 3 color channels: Cyan, Yellow, Magenta.',
      'Route each through its respective filter and power all 3 cores simultaneously.'
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
      { type: 'mirror', count: 6 }
    ],
    fixedItems: [
      { type: 'portal', portalId: 1, x: 5, y: 2 },
      { type: 'portal', portalId: 1, x: 2, y: 5 }
    ]
  },
  {
    id: 9,
    title: 'The Entanglement Matrix',
    difficulty: 'Mastermind',
    cols: 9,
    rows: 9,
    targetMoves: 12,
    hints: [
      'Combine dual portals and twin splitters to power four corners of the matrix.',
      'Position mirrors symmetrically.'
    ],
    emitters: [{ x: 4, y: 0, dir: 1, color: 'cyan' }], // Down from top center
    receptors: [
      { x: 1, y: 1, color: 'cyan' },
      { x: 7, y: 1, color: 'cyan' },
      { x: 1, y: 7, color: 'cyan' },
      { x: 7, y: 7, color: 'cyan' }
    ],
    inventory: [
      { type: 'splitter', count: 3 },
      { type: 'mirror', count: 6 }
    ],
    fixedItems: [
      { type: 'blocker', x: 4, y: 4 }
    ]
  }
];

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
      'Trace the direct optical angles from source to receiver.',
      'Place mirrors at 90-degree intersection intersections.'
    ],
    emitters: [{ x: emitterX, y: emitterY, dir: 0, color }],
    receptors: [{ x: receptorX, y: receptorY, color }],
    inventory,
    fixedItems: blockers
  };
}
