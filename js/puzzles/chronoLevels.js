/**
 * Chrono-Paradox Campaign Levels & Procedural Generator
 */

export const CHRONO_LEVELS = [
  {
    id: 1,
    title: 'Temporal Echo',
    difficulty: 'Novice',
    cols: 7,
    rows: 7,
    maxTimelineSteps: 15,
    maxClones: 1,
    targetMoves: 10,
    hints: [
      'Step onto the cyan pressure plate on the top-right.',
      'Stay there, then hit Spacebar / Rewind button.',
      'Your Ghost Clone will step on the plate while you walk straight to the exit!'
    ],
    playerStart: { x: 1, y: 3 },
    exitPortal: { x: 5, y: 3 },
    plates: [{ id: 1, x: 3, y: 1, doorId: 1 }],
    doors: [{ id: 1, x: 4, y: 3, isOpen: false }],
    batteries: [],
    walls: [
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 4, y: 5 }
    ]
  },
  {
    id: 2,
    title: 'Dual Synchrony',
    difficulty: 'Intermediate',
    cols: 8,
    rows: 8,
    maxTimelineSteps: 20,
    maxClones: 2,
    targetMoves: 16,
    hints: [
      'There are two sequential security doors.',
      'Timeline 1: Stand on Plate A.',
      'Timeline 2: Walk past Door A and stand on Plate B.',
      'Timeline 3: Rush through both opened doors to the exit!'
    ],
    playerStart: { x: 1, y: 3 },
    exitPortal: { x: 6, y: 3 },
    plates: [
      { id: 1, x: 2, y: 1, doorId: 1 },
      { id: 2, x: 4, y: 5, doorId: 2 }
    ],
    doors: [
      { id: 1, x: 3, y: 3, isOpen: false },
      { id: 2, x: 5, y: 3, isOpen: false }
    ],
    batteries: [],
    walls: [
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 3, y: 5 },
      { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 4 }, { x: 5, y: 5 }
    ]
  },
  {
    id: 3,
    title: 'Kinetic Battery',
    difficulty: 'Intermediate',
    cols: 8,
    rows: 8,
    maxTimelineSteps: 25,
    maxClones: 1,
    targetMoves: 14,
    hints: [
      'You can push yellow battery cubes.',
      'Push the battery onto Plate 1 so the gate remains open permanently, saving clone time.'
    ],
    playerStart: { x: 1, y: 4 },
    exitPortal: { x: 6, y: 4 },
    plates: [{ id: 1, x: 3, y: 2, doorId: 1 }],
    doors: [{ id: 1, x: 5, y: 4, isOpen: false }],
    batteries: [{ id: 1, x: 2, y: 2 }],
    walls: [
      { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 5 }, { x: 5, y: 6 }
    ]
  },
  {
    id: 4,
    title: 'Paradox Relay',
    difficulty: 'Advanced',
    cols: 8,
    rows: 8,
    maxTimelineSteps: 22,
    maxClones: 2,
    targetMoves: 18,
    hints: [
      'Ghost 1 must hold Switch 1 until step 10.',
      'Ghost 2 enters chamber 2 and steps on Switch 2 at step 10.',
      'Live Player rushes to exit at step 15.'
    ],
    playerStart: { x: 1, y: 1 },
    exitPortal: { x: 6, y: 6 },
    plates: [
      { id: 1, x: 1, y: 5, doorId: 1 },
      { id: 2, x: 5, y: 1, doorId: 2 }
    ],
    doors: [
      { id: 1, x: 4, y: 2, isOpen: false },
      { id: 2, x: 6, y: 4, isOpen: false }
    ],
    batteries: [],
    walls: [
      { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
      { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }
    ]
  },
  {
    id: 5,
    title: 'The Infinite Hall',
    difficulty: 'Mastermind',
    cols: 9,
    rows: 9,
    maxTimelineSteps: 30,
    maxClones: 2,
    targetMoves: 24,
    hints: [
      'Synchronize your steps with precision.',
      'One ghost holds Door 1, the second pushes the battery onto Plate 3, while you navigate the outer perimeter.'
    ],
    playerStart: { x: 1, y: 4 },
    exitPortal: { x: 7, y: 4 },
    plates: [
      { id: 1, x: 2, y: 2, doorId: 1 },
      { id: 2, x: 2, y: 6, doorId: 2 },
      { id: 3, x: 6, y: 2, doorId: 3 }
    ],
    doors: [
      { id: 1, x: 4, y: 2, isOpen: false },
      { id: 2, x: 4, y: 6, isOpen: false },
      { id: 3, x: 6, y: 4, isOpen: false }
    ],
    batteries: [{ id: 1, x: 3, y: 6 }],
    walls: [
      { x: 4, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 5 }, { x: 4, y: 7 },
      { x: 6, y: 1 }, { x: 6, y: 3 }, { x: 6, y: 5 }, { x: 6, y: 7 }
    ]
  }
];

export function generateProceduralChronoLevel(seed = Date.now(), difficulty = 'Normal') {
  const cols = 8;
  const rows = 8;
  const maxClones = difficulty === 'Hard' ? 2 : 1;

  const playerStart = { x: 1, y: 3 };
  const exitPortal = { x: cols - 2, y: 3 };

  const plates = [{ id: 1, x: 3, y: 1 + (seed % 2), doorId: 1 }];
  const doors = [{ id: 1, x: 5, y: 3, isOpen: false }];
  const walls = [
    { x: 5, y: 1 },
    { x: 5, y: 2 },
    { x: 5, y: 4 },
    { x: 5, y: 5 }
  ];

  return {
    id: `chrono_proc_${seed}`,
    title: `Chrono Chamber #${Math.abs(seed % 9999)}`,
    difficulty: difficulty,
    cols,
    rows,
    maxTimelineSteps: 20,
    maxClones,
    targetMoves: 12,
    hints: [
      'Step on the plate to trigger the door, then trigger Paradox Rewind (Space).',
      'Move in sync with your past clone to exit!'
    ],
    playerStart,
    exitPortal,
    plates,
    doors,
    batteries: [],
    walls
  };
}
