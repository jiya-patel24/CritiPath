/**
 * CritiPath File Bridge
 * ----------------------
 * Implements the TRUE file format contract for ENGINE.CPP and FILEIO.H.
 * 
 * GRAPH.TXT Format:
 *   NODE <id> <label>
 *   ...
 *   EDGE <from> <to> <cost> <directed>
 *   ...
 * Rules:
 *   - Max 20 nodes.
 *   - IDs must be 0, 1, 2, ... in order with no gaps.
 *   - Labels: max 49 chars, no whitespace (spaces converted to '_').
 *   - Cost: non-negative number < 9999.
 *   - Directed: 0 for two-way, 1 for one-way (from -> to).
 * 
 * RESULT.TXT Format:
 *   STATUS OK|ERROR
 *   COMMAND <name>
 *   PATH <v1> <v2> ... | PATH NONE
 *   COST <num> | STEPS <num>
 *   NEAREST <id> | NEAREST NONE
 *   BEFORE <v1> ... | AFTER <v1> ...
 *   IMPACT <num>
 *   CRITICAL_NODES <id1> ... | NONE
 *   BRIDGES <u-v> ... | NONE
 *   MESSAGE <text>
 */

class FileBridge {
  /**
   * Serializes in-memory nodes and edges into the engine's GRAPH.TXT syntax.
   */
  static serializeGraph(nodes, edges, excludeBlocked = false) {
    const lines = [];

    // All NODE lines come before EDGE lines
    nodes.forEach(n => {
      const label = (n.label || `Node_${n.id}`).trim().replace(/\s+/g, '_').slice(0, 49) || `Node_${n.id}`;
      lines.push(`NODE ${n.id} ${label}`);
    });

    edges.forEach(e => {
      if (excludeBlocked && e.blocked) return;
      const cost = Number(e.cost) || 1;
      const directed = e.directed ? 1 : 0;
      lines.push(`EDGE ${e.from} ${e.to} ${cost} ${directed}`);
    });

    return lines.join('\n') + '\n';
  }

  /**
   * Parses GRAPH.TXT from text into { nodes, edges }.
   */
  static parseGraph(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const nodes = [];
    const edges = [];
    const nodeIds = new Set();

    let expectingNodes = true;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const parts = line.split(/\s+/);
      const tag = parts[0].toUpperCase();

      if (tag === 'NODE') {
        if (!expectingNodes) {
          throw new Error(`Line ${lineIndex + 1}: All NODE lines must appear before EDGE lines.`);
        }
        if (parts.length < 3) {
          throw new Error(`Line ${lineIndex + 1}: NODE format requires "NODE <id> <label>"`);
        }
        const id = Number(parts[1]);
        const label = parts[2];

        if (isNaN(id) || id < 0) {
          throw new Error(`Line ${lineIndex + 1}: Invalid node ID "${parts[1]}"`);
        }
        if (id !== nodes.length) {
          throw new Error(`Line ${lineIndex + 1}: Node IDs must be 0, 1, 2, ... in order without gaps (found ${id}, expected ${nodes.length}).`);
        }
        if (nodes.length >= 20) {
          throw new Error(`Line ${lineIndex + 1}: Graph exceeds 20 nodes limit of the C++ engine.`);
        }

        nodes.push({ id, label, isTarget: false, x: 0, y: 0 });
        nodeIds.add(id);
      } else if (tag === 'EDGE') {
        expectingNodes = false;
        if (parts.length < 5) {
          throw new Error(`Line ${lineIndex + 1}: EDGE format requires "EDGE <from> <to> <cost> <directed>"`);
        }
        const from = Number(parts[1]);
        const to = Number(parts[2]);
        const cost = Number(parts[3]);
        const directed = Number(parts[4]);

        if (!nodeIds.has(from) || !nodeIds.has(to)) {
          throw new Error(`Line ${lineIndex + 1}: Edge ${from} -> ${to} refers to a non-existent node.`);
        }
        if (isNaN(cost) || cost < 0 || cost >= 9999) {
          throw new Error(`Line ${lineIndex + 1}: Cost must be non-negative and below 9999.`);
        }

        edges.push({ from, to, cost, directed: directed === 1, blocked: false });
      } else {
        throw new Error(`Line ${lineIndex + 1}: Unknown tag "${parts[0]}". Must be NODE or EDGE.`);
      }
    }

    if (nodes.length === 0) {
      throw new Error('Graph file contains no nodes.');
    }

    return { nodes, edges };
  }

  /**
   * Parses RESULT.TXT produced by the C++ engine.
   */
  static parseResult(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const res = {
      status: 'UNKNOWN',
      command: '',
      path: null,
      cost: null,
      steps: null,
      nearest: null,
      before: null,
      after: null,
      impact: null,
      criticalNodes: [],
      bridges: [],
      message: ''
    };

    lines.forEach(line => {
      const parts = line.split(/\s+/);
      const key = parts[0].toUpperCase();
      const vals = parts.slice(1);

      if (key === 'STATUS') {
        res.status = (vals[0] || 'UNKNOWN').toUpperCase();
      } else if (key === 'COMMAND') {
        res.command = (vals[0] || '').toUpperCase();
      } else if (key === 'MESSAGE') {
        res.message = vals.join(' ');
      } else if (key === 'PATH') {
        res.path = vals[0]?.toUpperCase() === 'NONE' ? [] : vals.map(Number);
      } else if (key === 'COST') {
        res.cost = Number(vals[0]);
      } else if (key === 'STEPS') {
        res.steps = Number(vals[0]);
      } else if (key === 'NEAREST') {
        res.nearest = vals[0]?.toUpperCase() === 'NONE' ? null : Number(vals[0]);
      } else if (key === 'BEFORE') {
        res.before = vals[0]?.toUpperCase() === 'NONE' ? [] : vals.map(Number);
      } else if (key === 'AFTER') {
        res.after = vals[0]?.toUpperCase() === 'NONE' ? [] : vals.map(Number);
      } else if (key === 'IMPACT') {
        res.impact = Number(vals[0]);
      } else if (key === 'CRITICAL_NODES') {
        res.criticalNodes = vals[0]?.toUpperCase() === 'NONE' ? [] : vals.map(Number);
      } else if (key === 'BRIDGES') {
        res.bridges = vals[0]?.toUpperCase() === 'NONE' ? [] : vals;
      }
    });

    return res;
  }
}
