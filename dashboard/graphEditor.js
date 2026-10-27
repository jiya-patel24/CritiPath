/**
 * CritiPath Graph Editor
 * -----------------------
 * Manages graph state in browser memory and enforces the constraints of the C++ engine:
 *   - At most 20 nodes (MAX_NODES = 20).
 *   - Contiguous node IDs (0, 1, ..., n-1 with NO gaps).
 *   - Automatic node renumbering and edge rewiring upon deletion.
 *   - Labels max 49 characters, alphanumeric and underscore.
 *   - Edge weights non-negative float < 9999.
 *   - Directed edges support (0 for two-way, 1 for one-way).
 *   - Tracks version for result invalidation.
 */

const MAX_ENGINE_NODES = 20;
const MAX_ENGINE_WEIGHT = 9999;
const MAX_ENGINE_LABEL = 49;

class GraphEditor {
  constructor(envKey = 'campus', defaultName = 'Campus Demo') {
    this.envKey = envKey;
    this.nodes = [];
    this.edges = [];
    this.version = 0;
    this.edited = false;
    this.name = defaultName;
    this.onStateChange = null;
  }

  touch() {
    this.version++;
    this.edited = true;
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this);
    }
  }

  load(nodes, edges, name = 'Campus Demo', markEdited = false) {
    this.name = name;
    this.nodes = nodes.map((n, idx) => ({
      id: idx,
      label: n.label || `Node_${idx}`,
      isTarget: !!n.isTarget,
      x: n.x || 0,
      y: n.y || 0
    }));

    this.edges = edges.map(e => ({
      from: Number(e.from),
      to: Number(e.to),
      cost: Number(e.cost) || 1,
      directed: !!e.directed,
      blocked: !!e.blocked
    }));

    if (this.nodes.some(n => !n.x && !n.y)) {
      this.layoutCircle();
    }

    this.version++;
    this.edited = markEdited;
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this);
    }
  }

  serializeState() {
    return {
      schemaVersion: 1,
      envKey: this.envKey,
      name: this.name,
      version: this.version,
      edited: this.edited,
      nodes: this.nodes.map(n => ({
        id: n.id,
        label: n.label,
        isTarget: !!n.isTarget,
        x: n.x,
        y: n.y
      })),
      edges: this.edges.map(e => ({
        from: e.from,
        to: e.to,
        cost: e.cost,
        directed: !!e.directed,
        blocked: !!e.blocked
      }))
    };
  }

  deserializeState(data) {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error('Invalid graph data schema: nodes or edges missing');
    }
    if (data.nodes.length > MAX_ENGINE_NODES) {
      throw new Error(`Graph exceeds maximum capacity of ${MAX_ENGINE_NODES} nodes`);
    }

    // Verify contiguous node IDs
    for (let i = 0; i < data.nodes.length; i++) {
      if (Number(data.nodes[i].id) !== i) {
        throw new Error(`Node ID non-contiguous at index ${i}`);
      }
    }

    this.name = data.name || this.name;
    this.version = Number(data.version) || 1;
    this.edited = !!data.edited;
    this.nodes = data.nodes.map((n, idx) => ({
      id: idx,
      label: (n.label || `Node_${idx}`).trim().replace(/\s+/g, '_').slice(0, MAX_ENGINE_LABEL),
      isTarget: !!n.isTarget,
      x: Number(n.x) || 0,
      y: Number(n.y) || 0
    }));

    this.edges = data.edges.map(e => ({
      from: Number(e.from),
      to: Number(e.to),
      cost: Number(e.cost) || 1,
      directed: !!e.directed,
      blocked: !!e.blocked
    }));

    if (this.nodes.some(n => !n.x && !n.y)) {
      this.layoutCircle();
    }
  }

  clear() {
    this.nodes = [];
    this.edges = [];
    this.name = 'New Graph';
    this.touch();
  }

  getNode(id) {
    return this.nodes.find(n => n.id === id);
  }

  findEdge(a, b) {
    return this.edges.find(e => {
      if (e.directed) {
        return e.from === a && e.to === b;
      }
      return (e.from === a && e.to === b) || (e.from === b && e.to === a);
    });
  }

  nextId() {
    return this.nodes.length;
  }

  /**
   * Adds a new node with the next contiguous ID.
   */
  addNode(labelText, isTarget = false) {
    if (this.nodes.length >= MAX_ENGINE_NODES) {
      return `Maximum node capacity reached (${MAX_ENGINE_NODES} nodes). The 16-bit C++ engine does not support more nodes.`;
    }

    const nextId = this.nextId();
    let label = (labelText || '').trim().replace(/\s+/g, '_');
    if (!label) {
      label = `Node_${nextId}`;
    }

    if (!/^[A-Za-z0-9_]{1,49}$/.test(label)) {
      return `Label must consist of 1 to ${MAX_ENGINE_LABEL} alphanumeric characters or underscores.`;
    }

    const spot = this.freeSpot();
    this.nodes.push({
      id: nextId,
      label,
      isTarget: !!isTarget,
      x: spot.x,
      y: spot.y
    });

    this.touch();
    return null;
  }

  /**
   * Adds an edge between two existing nodes.
   */
  addEdge(fromId, toId, costVal, isDirected = false) {
    const from = Number(fromId);
    const to = Number(toId);
    const cost = Number(costVal);

    if (isNaN(from) || isNaN(to) || !this.getNode(from) || !this.getNode(to)) {
      return 'Please choose two valid existing nodes.';
    }
    if (from === to) {
      return 'Self-loops are not allowed in this network.';
    }
    if (this.findEdge(from, to)) {
      return `An edge between node ${from} and node ${to} already exists.`;
    }
    if (isNaN(cost) || cost < 0 || cost >= MAX_ENGINE_WEIGHT) {
      return `Cost must be a positive number below ${MAX_ENGINE_WEIGHT}.`;
    }

    this.edges.push({
      from,
      to,
      cost,
      directed: !!isDirected,
      blocked: false
    });

    this.touch();
    return null;
  }

  /**
   * Removes a node, renumbers all remaining nodes to keep IDs 0..n-1 with NO gaps,
   * and updates all connected edges.
   */
  removeNode(id) {
    const targetNode = this.getNode(id);
    if (!targetNode) return -1;

    // Remove all edges connected to this node
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);

    // Build ID remapping: oldId -> newId
    const oldNodes = [...this.nodes];
    const newNodes = [];
    const idMap = new Map();

    let newCounter = 0;
    for (const n of oldNodes) {
      if (n.id !== id) {
        idMap.set(n.id, newCounter);
        newNodes.push({
          ...n,
          id: newCounter
        });
        newCounter++;
      }
    }

    // Rewire remaining edges with new IDs
    this.edges.forEach(e => {
      e.from = idMap.get(e.from);
      e.to = idMap.get(e.to);
    });

    this.nodes = newNodes;
    this.touch();
    return id;
  }

  /**
   * Removes an edge.
   */
  removeEdge(from, to) {
    const initialLen = this.edges.length;
    this.edges = this.edges.filter(e => !(
      (e.from === from && e.to === to) ||
      (!e.directed && e.from === to && e.to === from)
    ));
    if (this.edges.length !== initialLen) {
      this.touch();
      return true;
    }
    return false;
  }

  /**
   * Toggles blocked status of an edge.
   */
  toggleBlocked(from, to) {
    const e = this.findEdge(from, to);
    if (e) {
      e.blocked = !e.blocked;
      this.touch();
      return e.blocked;
    }
    return null;
  }

  toggleTarget(id) {
    const n = this.getNode(id);
    if (n) {
      n.isTarget = !n.isTarget;
      this.touch();
      return n.isTarget;
    }
    return null;
  }

  setPosition(id, x, y) {
    const n = this.getNode(id);
    if (n) {
      n.x = Math.round(x);
      n.y = Math.round(y);
      if (typeof this.onStateChange === 'function') {
        this.onStateChange(this);
      }
    }
  }

  layoutCircle() {
    const count = this.nodes.length;
    if (count === 0) return;
    const cx = 400, cy = 200, rx = 280, ry = 140;
    this.nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      n.x = Math.round(cx + rx * Math.cos(angle));
      n.y = Math.round(cy + ry * Math.sin(angle));
    });
  }

  freeSpot() {
    for (let i = 0; i < 200; i++) {
      const x = 400 + (30 + i * 8) * Math.cos(i * 2.5);
      const y = 200 + (25 + i * 6) * Math.sin(i * 2.5);
      if (x < 50 || x > 750 || y < 50 || y > 350) continue;
      if (this.nodes.every(n => Math.hypot(n.x - x, n.y - y) > 65)) {
        return { x: Math.round(x), y: Math.round(y) };
      }
    }
    return { x: 80, y: 80 };
  }
}
