/**
 * CritiPath Graph View
 * --------------------
 * Interactive SVG renderer with drag-and-drop node positioning, zoom/pan controls,
 * unified typography, and clean, non-colliding indicators for route, target, start,
 * destination, blocked edges, and critical points.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

class GraphView {
  constructor(svgElement, { onSelect, onMove }) {
    this.svg = svgElement;
    this.onSelect = onSelect;
    this.onMove = onMove;

    this.dragId = null;
    this.viewBox = { x: 0, y: 0, width: 800, height: 420 };
    this.baseViewBox = { ...this.viewBox };

    this.setupDefs();
    this.bindEvents();
  }

  setupDefs() {
    let defs = this.svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      this.svg.appendChild(defs);
    }
    defs.innerHTML = `
      <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#626B63" />
      </marker>
      <marker id="arrow-route" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38745B" />
      </marker>
    `;
  }

  bindEvents() {
    const svg = this.svg;

    svg.addEventListener('pointerdown', e => {
      const nodeEl = e.target.closest('[data-node]');
      if (nodeEl) {
        this.dragId = Number(nodeEl.dataset.node);
        svg.setPointerCapture(e.pointerId);
        this.onSelect(this.dragId);
      }
    });

    svg.addEventListener('pointermove', e => {
      if (this.dragId === null) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      // Keep nodes well within bounds so labels and badges never clip
      this.onMove(
        this.dragId,
        Math.min(745, Math.max(55, svgP.x)),
        Math.min(365, Math.max(50, svgP.y))
      );
    });

    const endDrag = () => { this.dragId = null; };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
  }

  zoom(factor) {
    const cx = this.viewBox.x + this.viewBox.width / 2;
    const cy = this.viewBox.y + this.viewBox.height / 2;
    const newW = Math.max(320, Math.min(1500, this.viewBox.width * factor));
    const newH = Math.max(170, Math.min(800, this.viewBox.height * factor));
    this.viewBox.width = newW;
    this.viewBox.height = newH;
    this.viewBox.x = cx - newW / 2;
    this.viewBox.y = cy - newH / 2;
    this.applyViewBox();
  }

  resetView() {
    this.viewBox = { ...this.baseViewBox };
    this.applyViewBox();
  }

  fitView(nodes) {
    if (!nodes || nodes.length === 0) {
      this.resetView();
      return;
    }
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs) - 65;
    const maxX = Math.max(...xs) + 65;
    const minY = Math.min(...ys) - 60;
    const maxY = Math.max(...ys) + 65;

    const w = Math.max(520, maxX - minX);
    const h = Math.max(300, maxY - minY);

    this.viewBox = { x: minX, y: minY, width: w, height: h };
    this.applyViewBox();
  }

  applyViewBox() {
    const { x, y, width, height } = this.viewBox;
    this.svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  }

  el(tag, attrs, text) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v !== false && v !== null && v !== undefined) {
          node.setAttribute(k, v);
        }
      });
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }

  render({
    nodes,
    edges,
    selectedId,
    startId,
    destId,
    routePath = [],
    targetIds = [],
    criticalNodes = [],
    bridgeEdges = []
  }) {
    const defs = this.svg.querySelector('defs');
    this.svg.replaceChildren();
    if (defs) this.svg.appendChild(defs);

    if (!nodes || !nodes.length) {
      this.svg.append(
        this.el('text', {
          x: 400,
          y: 210,
          class: 'empty-text',
          'text-anchor': 'middle'
        }, 'The graph is empty. Add nodes in Graph Editor or reset to sample.')
      );
      return;
    }

    const byId = new Map(nodes.map(n => [n.id, n]));
    const keyPair = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

    // Build sets for quick highlight lookups
    const routeEdgeSet = new Set();
    for (let i = 0; i < routePath.length - 1; i++) {
      routeEdgeSet.add(`${routePath[i]}->${routePath[i + 1]}`);
      routeEdgeSet.add(`${routePath[i + 1]}->${routePath[i]}`);
    }

    const bridgeSet = new Set(bridgeEdges.map(b => {
      const parts = b.split('-').map(Number);
      return keyPair(parts[0], parts[1]);
    }));

    const edgeGroup = this.el('g', { class: 'edges-layer' });
    const labelGroup = this.el('g', { class: 'edge-labels-layer' });
    const nodeGroup = this.el('g', { class: 'nodes-layer' });

    // 1. Draw Edges
    edges.forEach(e => {
      const u = byId.get(e.from);
      const v = byId.get(e.to);
      if (!u || !v) return;

      const isRoute = routeEdgeSet.has(`${e.from}->${e.to}`) || routeEdgeSet.has(`${e.to}->${e.from}`);
      const isBridge = bridgeSet.has(keyPair(e.from, e.to));
      const isBlocked = !!e.blocked;

      let cls = 'graph-edge';
      if (isRoute) cls += ' on-route';
      if (isBridge) cls += ' is-bridge';
      if (isBlocked) cls += ' is-blocked';

      const lineAttrs = {
        x1: u.x,
        y1: u.y,
        x2: v.x,
        y2: v.y,
        class: cls
      };

      if (e.directed) {
        lineAttrs['marker-end'] = isRoute ? 'url(#arrow-route)' : 'url(#arrow)';
      }

      edgeGroup.appendChild(this.el('line', lineAttrs));

      // Weight badge
      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;

      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const len = Math.hypot(dx, dy) || 1;
      const offX = (-dy / len) * 8;
      const offY = (dx / len) * 8;

      const lblG = this.el('g', {
        class: 'edge-weight-badge',
        transform: `translate(${midX + offX}, ${midY + offY})`
      });

      const costText = `${e.cost}${e.directed ? ' (1-way)' : ''}`;
      const rectW = Math.max(26, costText.length * 6.5 + 10);

      lblG.appendChild(this.el('rect', {
        x: -rectW / 2,
        y: -8.5,
        width: rectW,
        height: 17,
        rx: 3.5,
        class: isBlocked ? 'weight-bg-blocked' : 'weight-bg'
      }));

      lblG.appendChild(this.el('text', {
        x: 0,
        y: 3.5,
        'text-anchor': 'middle',
        class: isBlocked ? 'weight-text-blocked' : 'weight-text'
      }, isBlocked ? `${e.cost} ✕` : costText));

      labelGroup.appendChild(lblG);
    });

    // 2. Draw Nodes
    nodes.forEach(n => {
      const isSelected = n.id === selectedId;
      const isStart = n.id === startId;
      const isDest = n.id === destId;
      const isTarget = n.isTarget || targetIds.includes(n.id);
      const isOnRoute = routePath.includes(n.id);
      const isCritical = criticalNodes.includes(n.id);

      let nodeCls = 'graph-node';
      if (isSelected) nodeCls += ' is-selected';
      if (isStart) nodeCls += ' is-start';
      if (isDest) nodeCls += ' is-dest';
      if (isOnRoute) nodeCls += ' on-route';
      if (isCritical) nodeCls += ' is-critical';

      const g = this.el('g', {
        class: nodeCls,
        transform: `translate(${n.x}, ${n.y})`,
        'data-node': n.id,
        role: 'button',
        tabindex: 0,
        'aria-label': `Node ${n.id}: ${n.label}`
      });

      // Subtle Selection Ring: ONLY for the currently selected node
      if (isSelected) {
        g.appendChild(this.el('circle', {
          cx: 0,
          cy: 0,
          r: 26,
          class: 'selection-halo'
        }));
      }

      // Base Node Shape: target is rounded rectangle; normal is circle
      if (isTarget) {
        g.appendChild(this.el('rect', {
          x: -19,
          y: -19,
          width: 38,
          height: 38,
          rx: 6,
          class: 'node-shape target-shape'
        }));
      } else {
        g.appendChild(this.el('circle', {
          cx: 0,
          cy: 0,
          r: 20,
          class: 'node-shape circle-shape'
        }));
      }

      // Centered Node ID
      g.appendChild(this.el('text', {
        x: 0,
        y: 4.5,
        'text-anchor': 'middle',
        class: 'node-id'
      }, String(n.id)));

      // Node Label (positioned clearly below the node circle)
      const displayLabel = (n.label || '').replace(/_/g, ' ');
      g.appendChild(this.el('text', {
        x: 0,
        y: 36,
        'text-anchor': 'middle',
        class: 'node-name'
      }, displayLabel));

      // Distinct, non-colliding indicators
      // 1. Start marker (clean pill above node)
      if (isStart) {
        const badge = this.el('g', { class: 'role-badge start-badge', transform: 'translate(0, -25)' });
        badge.appendChild(this.el('rect', { x: -14, y: -6, width: 28, height: 12, rx: 3 }));
        badge.appendChild(this.el('text', { x: 0, y: 3, 'text-anchor': 'middle' }, 'START'));
        g.appendChild(badge);
      }
      // 2. Destination marker (clean pill above node)
      else if (isDest) {
        const badge = this.el('g', { class: 'role-badge dest-badge', transform: 'translate(0, -25)' });
        badge.appendChild(this.el('rect', { x: -12, y: -6, width: 24, height: 12, rx: 3 }));
        badge.appendChild(this.el('text', { x: 0, y: 3, 'text-anchor': 'middle' }, 'END'));
        g.appendChild(badge);
      }

      // 3. Target indicator (small square icon at top right)
      if (isTarget) {
        const badge = this.el('g', { class: 'role-badge target-badge', transform: 'translate(13, -15)' });
        badge.appendChild(this.el('rect', { x: -6, y: -6, width: 12, height: 12, rx: 2 }));
        badge.appendChild(this.el('text', { x: 0, y: 3, 'text-anchor': 'middle' }, 'T'));
        g.appendChild(badge);
      }

      // 4. Critical articulation point indicator (amber exclamation at top left)
      if (isCritical) {
        const badge = this.el('g', { class: 'role-badge critical-badge', transform: 'translate(-13, -15)' });
        badge.appendChild(this.el('circle', { cx: 0, cy: 0, r: 6.5 }));
        badge.appendChild(this.el('text', { x: 0, y: 3, 'text-anchor': 'middle' }, '!'));
        g.appendChild(badge);
      }

      nodeGroup.appendChild(g);
    });

    this.svg.appendChild(edgeGroup);
    this.svg.appendChild(labelGroup);
    this.svg.appendChild(nodeGroup);
  }
}
