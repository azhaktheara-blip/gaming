/**
 * Synaptic Cipher Logic Gates Levels & Procedural Generator
 */

export const CIPHER_LEVELS = [
  {
    id: 1,
    title: 'Logic Primitive',
    difficulty: 'Novice',
    targetMoves: 3,
    hints: [
      'AND gate requires both inputs to be 1 to output 1.',
      'Toggle inputs A and B to 1 to activate Output Q1.'
    ],
    inputs: [
      { id: 'A', value: 0 },
      { id: 'B', value: 0 }
    ],
    gates: [
      { id: 'G1', type: 'AND', in1: 'A', in2: 'B', x: 0.5, y: 0.5 }
    ],
    outputs: [
      { id: 'Q1', source: 'G1', target: 1 }
    ]
  },
  {
    id: 2,
    title: 'Inverted Parity',
    difficulty: 'Novice',
    targetMoves: 4,
    hints: [
      'XOR outputs 1 only when inputs differ (one 0 and one 1).',
      'The NOT gate will invert whatever G1 outputs.'
    ],
    inputs: [
      { id: 'A', value: 0 },
      { id: 'B', value: 0 },
      { id: 'C', value: 0 }
    ],
    gates: [
      { id: 'G1', type: 'XOR', in1: 'A', in2: 'B', x: 0.4, y: 0.35 },
      { id: 'G2', type: 'NOT', in1: 'C', in2: null, x: 0.4, y: 0.65 },
      { id: 'G3', type: 'AND', in1: 'G1', in2: 'G2', x: 0.7, y: 0.5 }
    ],
    outputs: [
      { id: 'Q1', source: 'G3', target: 1 }
    ]
  },
  {
    id: 3,
    title: 'Dual Constraint Decoder',
    difficulty: 'Intermediate',
    targetMoves: 6,
    hints: [
      'You must satisfy TWO distinct target outputs simultaneously: Q1=1 and Q2=0.',
      'Trace how Input B branches into both branches.'
    ],
    inputs: [
      { id: 'A', value: 0 },
      { id: 'B', value: 0 },
      { id: 'C', value: 0 },
      { id: 'D', value: 0 }
    ],
    gates: [
      { id: 'G1', type: 'OR', in1: 'A', in2: 'B', x: 0.4, y: 0.3 },
      { id: 'G2', type: 'NAND', in1: 'B', in2: 'C', x: 0.4, y: 0.5 },
      { id: 'G3', type: 'XOR', in1: 'C', in2: 'D', x: 0.4, y: 0.7 },
      { id: 'G4', type: 'AND', in1: 'G1', in2: 'G2', x: 0.7, y: 0.4 },
      { id: 'G5', type: 'NOR', in1: 'G2', in2: 'G3', x: 0.7, y: 0.65 }
    ],
    outputs: [
      { id: 'Q1', source: 'G4', target: 1 },
      { id: 'Q2', source: 'G5', target: 0 }
    ]
  },
  {
    id: 4,
    title: 'Quantum Half-Adder',
    difficulty: 'Advanced',
    targetMoves: 8,
    hints: [
      'A half-adder computes the Sum (XOR) and Carry (AND) bits of two numbers.',
      'Set inputs such that Sum Q1 = 1 and Carry Q2 = 0.'
    ],
    inputs: [
      { id: 'A', value: 0 },
      { id: 'B', value: 0 },
      { id: 'C_IN', value: 0 }
    ],
    gates: [
      { id: 'G1', type: 'XOR', in1: 'A', in2: 'B', x: 0.4, y: 0.3 },
      { id: 'G2', type: 'AND', in1: 'A', in2: 'B', x: 0.4, y: 0.7 },
      { id: 'G3', type: 'XOR', in1: 'G1', in2: 'C_IN', x: 0.7, y: 0.3 },
      { id: 'G4', type: 'OR', in1: 'G2', in2: 'C_IN', x: 0.7, y: 0.7 }
    ],
    outputs: [
      { id: 'SUM', source: 'G3', target: 1 },
      { id: 'CARRY', source: 'G4', target: 1 }
    ]
  }
];

export function generateProceduralCipherLevel(seed = Date.now(), difficulty = 'Normal') {
  return {
    id: `cipher_proc_${seed}`,
    title: `Cyber Synapse #${Math.abs(seed % 9999)}`,
    difficulty: difficulty,
    targetMoves: 5,
    hints: [
      'Test each bit systematically.',
      'Use truth table deduction to satisfy the target outputs.'
    ],
    inputs: [
      { id: 'A', value: (seed >> 0) & 1 },
      { id: 'B', value: (seed >> 1) & 1 },
      { id: 'C', value: (seed >> 2) & 1 }
    ],
    gates: [
      { id: 'G1', type: (seed % 2 === 0 ? 'XOR' : 'AND'), in1: 'A', in2: 'B', x: 0.4, y: 0.35 },
      { id: 'G2', type: (seed % 3 === 0 ? 'NOR' : 'OR'), in1: 'B', in2: 'C', x: 0.4, y: 0.65 },
      { id: 'G3', type: 'AND', in1: 'G1', in2: 'G2', x: 0.7, y: 0.5 }
    ],
    outputs: [
      { id: 'Q1', source: 'G3', target: 1 }
    ]
  };
}
