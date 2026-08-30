/**
 * Synaptic Cipher - Boolean Logic & Circuit Deduction Engine
 */
export class CipherEngine {
  constructor(levelData) {
    this.init(levelData);
  }

  init(levelData) {
    this.id = levelData.id;
    this.title = levelData.title || 'Synaptic Cipher';
    this.targetMoves = levelData.targetMoves || 8;
    this.hints = levelData.hints || [
      'Toggle the input switches (0 / 1) to send logic signals through the gates.',
      'Trace logic operations: AND requires both 1s; XOR requires one 1; NOT inverts the signal.',
      'Configure inputs to match all target outputs!'
    ];

    this.inputs = JSON.parse(JSON.stringify(levelData.inputs || [
      { id: 'A', value: 0 },
      { id: 'B', value: 0 },
      { id: 'C', value: 0 }
    ]));

    this.gates = JSON.parse(JSON.stringify(levelData.gates || []));
    this.outputs = JSON.parse(JSON.stringify(levelData.outputs || []));

    this.probes = 0;
    this.moves = 0;
    this.isSolved = false;

    this.evaluateCircuit();
  }

  // Evaluate boolean logic gates
  evalGate(type, in1, in2) {
    switch (type.toUpperCase()) {
      case 'AND': return in1 && in2 ? 1 : 0;
      case 'OR':  return in1 || in2 ? 1 : 0;
      case 'XOR': return in1 !== in2 ? 1 : 0;
      case 'NAND': return !(in1 && in2) ? 1 : 0;
      case 'NOR':  return !(in1 || in2) ? 1 : 0;
      case 'XNOR': return in1 === in2 ? 1 : 0;
      case 'NOT': return in1 ? 0 : 1;
      case 'BUFFER': return in1 ? 1 : 0;
      default: return 0;
    }
  }

  toggleInput(inputId) {
    const input = this.inputs.find(i => i.id === inputId);
    if (!input) return false;

    input.value = input.value === 1 ? 0 : 1;
    this.moves++;
    this.probes++;
    this.evaluateCircuit();
    return true;
  }

  evaluateCircuit() {
    const signalMap = {};

    // Populate initial inputs
    this.inputs.forEach(i => {
      signalMap[i.id] = i.value;
    });

    // Evaluate gates in topological order
    this.gates.forEach(gate => {
      const in1 = signalMap[gate.in1] ?? 0;
      const in2 = gate.in2 ? (signalMap[gate.in2] ?? 0) : 0;
      const out = this.evalGate(gate.type, in1, in2);
      gate.outputValue = out;
      signalMap[gate.id] = out;
    });

    // Evaluate target outputs
    let allOutputsMatched = true;
    this.outputs.forEach(out => {
      const actual = signalMap[out.source] ?? 0;
      out.currentValue = actual;
      out.isSatisfied = actual === out.target;
      if (!out.isSatisfied) {
        allOutputsMatched = false;
      }
    });

    this.isSolved = allOutputsMatched;
    return this.isSolved;
  }

  getStarRating() {
    if (!this.isSolved) return 0;
    if (this.moves <= this.targetMoves) return 3;
    if (this.moves <= this.targetMoves + 4) return 2;
    return 1;
  }
}
