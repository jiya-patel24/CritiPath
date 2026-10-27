/**
 * CritiPath Dashboard Application Controller
 * -------------------------------------------
 * Coordinates multi-environment state (Campus, Hospital, Mall), UI navigation,
 * SVG rendering, versioned localStorage persistence, and real C++ engine integration.
 */

const DEFAULT_ENVIRONMENTS = {
  campus: {
    id: 'campus',
    name: 'Campus Demo',
    nodes: [
      { id: 0, label: 'Main_Gate', x: 100, y: 200, isTarget: false },
      { id: 1, label: 'Admin', x: 280, y: 210, isTarget: false },
      { id: 2, label: 'Library', x: 480, y: 210, isTarget: false },
      { id: 3, label: 'Canteen', x: 520, y: 80, isTarget: true },
      { id: 4, label: 'Auditorium', x: 350, y: 320, isTarget: false },
      { id: 5, label: 'Lab_A', x: 700, y: 200, isTarget: true },
      { id: 6, label: 'Lab_B', x: 600, y: 320, isTarget: false },
      { id: 7, label: 'Parking', x: 300, y: 80, isTarget: false }
    ],
    edges: [
      { from: 0, to: 7, cost: 50, directed: 0, blocked: false },
      { from: 0, to: 1, cost: 70, directed: 0, blocked: false },
      { from: 1, to: 7, cost: 40, directed: 0, blocked: false },
      { from: 1, to: 2, cost: 75, directed: 0, blocked: false },
      { from: 1, to: 4, cost: 90, directed: 0, blocked: false },
      { from: 7, to: 3, cost: 60, directed: 0, blocked: false },
      { from: 3, to: 2, cost: 50, directed: 0, blocked: false },
      { from: 3, to: 5, cost: 80, directed: 0, blocked: false },
      { from: 2, to: 5, cost: 120, directed: 0, blocked: true },
      { from: 2, to: 6, cost: 100, directed: 0, blocked: false },
      { from: 4, to: 6, cost: 60, directed: 0, blocked: false }
    ]
  },
  hospital: {
    id: 'hospital',
    name: 'Hospital Demo',
    nodes: [
      { id: 0, label: 'Main_Entrance', x: 80, y: 190, isTarget: false },
      { id: 1, label: 'Reception', x: 220, y: 190, isTarget: false },
      { id: 2, label: 'Waiting_Area', x: 220, y: 80, isTarget: false },
      { id: 3, label: 'OPD', x: 390, y: 80, isTarget: false },
      { id: 4, label: 'Emergency_Dept', x: 390, y: 190, isTarget: true },
      { id: 5, label: 'Pharmacy', x: 220, y: 310, isTarget: true },
      { id: 6, label: 'Diagnostics', x: 550, y: 80, isTarget: false },
      { id: 7, label: 'Ward', x: 700, y: 130, isTarget: false },
      { id: 8, label: 'Lift_Lobby', x: 550, y: 260, isTarget: false },
      { id: 9, label: 'Cafeteria', x: 390, y: 310, isTarget: false }
    ],
    edges: [
      { from: 0, to: 1, cost: 15, directed: 0, blocked: false },
      { from: 1, to: 2, cost: 10, directed: 0, blocked: false },
      { from: 2, to: 3, cost: 15, directed: 0, blocked: false },
      { from: 1, to: 4, cost: 25, directed: 0, blocked: false },
      { from: 1, to: 5, cost: 20, directed: 0, blocked: false },
      { from: 3, to: 6, cost: 20, directed: 0, blocked: false },
      { from: 6, to: 7, cost: 25, directed: 0, blocked: false },
      { from: 7, to: 8, cost: 10, directed: 0, blocked: false },
      { from: 1, to: 8, cost: 30, directed: 0, blocked: false },
      { from: 8, to: 9, cost: 20, directed: 0, blocked: false },
      { from: 5, to: 9, cost: 25, directed: 0, blocked: false },
      { from: 4, to: 6, cost: 15, directed: 0, blocked: false }
    ]
  },
  mall: {
    id: 'mall',
    name: 'Mall Demo',
    nodes: [
      { id: 0, label: 'Main_Entrance', x: 90, y: 120, isTarget: false },
      { id: 1, label: 'Info_Desk', x: 220, y: 120, isTarget: false },
      { id: 2, label: 'Central_Atrium', x: 350, y: 180, isTarget: false },
      { id: 3, label: 'Fashion_Store', x: 480, y: 80, isTarget: false },
      { id: 4, label: 'Electronics', x: 480, y: 290, isTarget: false },
      { id: 5, label: 'Supermarket', x: 220, y: 270, isTarget: false },
      { id: 6, label: 'Food_Court', x: 605, y: 130, isTarget: true },
      { id: 7, label: 'Cinema', x: 715, y: 200, isTarget: false },
      { id: 8, label: 'Lift_Lobby', x: 480, y: 185, isTarget: false },
      { id: 9, label: 'Parking_Entrance', x: 90, y: 270, isTarget: true }
    ],
    edges: [
      { from: 0, to: 1, cost: 15, directed: 0, blocked: false },
      { from: 1, to: 2, cost: 15, directed: 0, blocked: false },
      { from: 2, to: 3, cost: 20, directed: 0, blocked: false },
      { from: 2, to: 4, cost: 25, directed: 0, blocked: false },
      { from: 2, to: 5, cost: 30, directed: 0, blocked: false },
      { from: 2, to: 8, cost: 15, directed: 0, blocked: false },
      { from: 8, to: 6, cost: 25, directed: 0, blocked: false },
      { from: 6, to: 7, cost: 20, directed: 0, blocked: false },
      { from: 4, to: 7, cost: 35, directed: 0, blocked: false },
      { from: 5, to: 9, cost: 25, directed: 0, blocked: false },
      { from: 9, to: 0, cost: 40, directed: 0, blocked: false },
      { from: 3, to: 6, cost: 30, directed: 0, blocked: false }
    ]
  }
};

const STORAGE_PREFIX = 'critipath_env_';
const ACTIVE_ENV_KEY = 'critipath_active_env_v1';

class CritiPathApp {
  constructor() {
    this.currentEnv = 'campus';
    this.currentView = 'route';

    // Three fully independent GraphEditor instances
    this.environments = {
      campus: new GraphEditor('campus', 'Campus Demo'),
      hospital: new GraphEditor('hospital', 'Hospital Demo'),
      mall: new GraphEditor('mall', 'Mall Demo')
    };

    // Attach persistence callback to each environment
    Object.keys(this.environments).forEach(key => {
      this.environments[key].onStateChange = () => this.saveEnvironment(key);
    });

    this.api = new ApiClient();
    this.view = null;

    this.selectedId = null;
    this.startId = null;
    this.destId = null;

    this.activeResult = null; // { command, parsed, graphVersion, envKey, isStale, execMs }
    this.engineConnected = false;

    this.init();
  }

  get editor() {
    return this.environments[this.currentEnv] || this.environments.campus;
  }

  async init() {
    this.initGraphView();
    this.bindEvents();

    // 1. Restore all environments from localStorage or initialize defaults
    this.initAllEnvironments();

    // 2. Restore active environment selection
    let savedEnv = 'campus';
    try {
      const stored = localStorage.getItem(ACTIVE_ENV_KEY);
      if (stored && this.environments[stored]) {
        savedEnv = stored;
      }
    } catch (e) {}

    this.currentEnv = savedEnv;
    this.updateEnvNavState();

    // 3. Set default start & dest if not set
    if (this.editor.nodes.length >= 2) {
      this.startId = 0;
      this.destId = Math.min(2, this.editor.nodes.length - 1);
    }

    this.refreshAll();
    this.view.fitView(this.editor.nodes);

    await this.checkEngineStatus();

    // Periodic heartbeat to verify engine connectivity truthfully
    setInterval(() => this.checkEngineStatus(), 6000);
  }

  $(id) {
    return document.getElementById(id);
  }

  initGraphView() {
    const svgEl = this.$('graph-svg');
    this.view = new GraphView(svgEl, {
      onSelect: (id) => this.handleNodeSelect(id),
      onMove: (id, x, y) => {
        this.editor.setPosition(id, x, y);
        this.renderGraph();
      }
    });
  }

  initAllEnvironments() {
    ['campus', 'hospital', 'mall'].forEach(envKey => {
      this.loadEnvironment(envKey);
    });
  }

  loadEnvironment(envKey) {
    const editor = this.environments[envKey];
    const storageKey = `${STORAGE_PREFIX}${envKey}_v1`;
    let loaded = false;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        editor.deserializeState(parsed);
        loaded = true;
      }
    } catch (err) {
      console.warn(`Could not restore localStorage for ${envKey}, loading default`, err);
    }

    if (!loaded) {
      const def = DEFAULT_ENVIRONMENTS[envKey] || DEFAULT_ENVIRONMENTS.campus;
      editor.load(def.nodes, def.edges, def.name, false);
      this.saveEnvironment(envKey);
    }
  }

  saveEnvironment(envKey) {
    try {
      const editor = this.environments[envKey];
      if (editor) {
        const storageKey = `${STORAGE_PREFIX}${envKey}_v1`;
        localStorage.setItem(storageKey, JSON.stringify(editor.serializeState()));
      }
    } catch (err) {
      console.warn(`Failed to persist ${envKey} to localStorage`, err);
    }
  }

  switchEnvironment(envKey) {
    if (!this.environments[envKey] || envKey === this.currentEnv) return;

    this.currentEnv = envKey;
    try {
      localStorage.setItem(ACTIVE_ENV_KEY, envKey);
    } catch (e) {}

    this.updateEnvNavState();

    // Clear transient selections & stale results to protect view integrity
    this.selectedId = null;
    this.activeResult = null;

    // Reset analysis result panels
    const routeContainer = this.$('route-result-container');
    if (routeContainer) {
      routeContainer.innerHTML = '<p class="hint-text">Select parameters and click "Find Route" to execute analysis on the C++ engine.</p>';
    }
    const netContainer = this.$('network-result-container');
    if (netContainer) {
      netContainer.innerHTML = '<p class="hint-text">Choose an analysis to run on the network.</p>';
    }

    // Set intelligent default start & dest for the newly active environment
    if (this.editor.nodes.length >= 2) {
      this.startId = 0;
      this.destId = Math.min(2, this.editor.nodes.length - 1);
    } else {
      this.startId = null;
      this.destId = null;
    }

    this.refreshAll();
    this.view.fitView(this.editor.nodes);
  }

  updateEnvNavState() {
    document.querySelectorAll('.sidebar-env-list .env-item').forEach(item => {
      item.classList.toggle('active', item.dataset.env === this.currentEnv);
    });
    const chip = this.$('graph-name-chip');
    if (chip) {
      chip.textContent = this.editor.name;
    }
  }

  bindEvents() {
    // 1. Sidebar Environment Selection
    document.querySelectorAll('.sidebar-env-list .env-item').forEach(item => {
      item.addEventListener('click', () => {
        const env = item.dataset.env;
        this.switchEnvironment(env);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.switchEnvironment(item.dataset.env);
        }
      });
    });

    // 2. Sidebar Navigation (Page switching)
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        this.switchView(view);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.switchView(item.dataset.view);
        }
      });
    });

    // 3. Consolidated Graph Workspace Controls
    this.$('btn-fit-view').addEventListener('click', () => {
      this.view.fitView(this.editor.nodes);
    });
    this.$('zoom-in').addEventListener('click', () => this.view.zoom(0.85));
    this.$('zoom-out').addEventListener('click', () => this.view.zoom(1.15));
    this.$('zoom-reset').addEventListener('click', () => this.view.resetView());

    // 4. Top Bar Actions
    this.$('btn-reset-sample').addEventListener('click', () => {
      this.promptResetCurrentGraph();
    });

    this.$('btn-export-graph').addEventListener('click', () => {
      this.exportGraphFile();
    });

    // 5. Selection Bar Actions
    this.$('btn-set-start').addEventListener('click', () => {
      if (this.selectedId !== null) {
        this.startId = this.selectedId;
        this.syncDropdowns();
        this.renderSelection();
        this.renderGraph();
      }
    });

    this.$('btn-set-dest').addEventListener('click', () => {
      if (this.selectedId !== null) {
        this.destId = this.selectedId;
        this.syncDropdowns();
        this.renderSelection();
        this.renderGraph();
      }
    });

    this.$('btn-toggle-target').addEventListener('click', () => {
      if (this.selectedId !== null) {
        this.editor.toggleTarget(this.selectedId);
        this.invalidateResults();
        this.refreshAll();
      }
    });

    this.$('btn-clear-sel').addEventListener('click', () => {
      this.selectedId = null;
      this.renderSelection();
      this.renderGraph();
    });

    // 6. Route Analysis Controls
    this.$('route-mode-select').addEventListener('change', (e) => {
      const mode = e.target.value;
      this.$('route-p2p-fields').style.display = mode === 'point-to-point' ? 'block' : 'none';
      this.$('route-nearest-fields').style.display = mode === 'nearest-target' ? 'block' : 'none';
      this.$('btn-run-route').textContent = mode === 'point-to-point' ? 'Find Route' : 'Find Nearest Target';
    });

    this.$('btn-run-route').addEventListener('click', () => this.runRouteAnalysis());
    this.$('btn-clear-route-results').addEventListener('click', () => {
      this.activeResult = null;
      this.$('route-result-container').innerHTML = '<p class="hint-text">Results cleared.</p>';
      this.renderGraph();
    });

    // 7. Network Analysis Controls
    this.$('network-op-select').addEventListener('change', (e) => {
      const op = e.target.value;
      this.$('net-block-controls').style.display = op === 'block' ? 'block' : 'none';
      this.$('net-critical-controls').style.display = op === 'critical' ? 'block' : 'none';
      this.$('net-isolate-controls').style.display = op === 'isolate' ? 'block' : 'none';
    });

    this.$('btn-run-block').addEventListener('click', () => this.runBlockSimulation());
    this.$('btn-run-critical').addEventListener('click', () => this.runCriticalScan());
    this.$('btn-run-isolate').addEventListener('click', () => this.runIsolationImpact());

    // 8. Overview Quick Actions
    this.$('btn-quick-route').addEventListener('click', () => {
      this.switchView('route');
      this.syncDropdowns();
      this.runRouteAnalysis();
    });

    this.$('btn-quick-critical').addEventListener('click', () => {
      this.switchView('network');
      this.$('network-op-select').value = 'critical';
      this.$('network-op-select').dispatchEvent(new Event('change'));
      this.runCriticalScan();
    });

    this.$('btn-quick-editor').addEventListener('click', () => {
      this.switchView('editor');
    });

    // 9. Graph Editor Form Handlers
    this.$('form-add-node').addEventListener('submit', (e) => {
      e.preventDefault();
      const label = this.$('new-node-label').value;
      const isTarget = this.$('new-node-target').checked;
      const err = this.editor.addNode(label, isTarget);

      const msgEl = this.$('msg-node');
      if (err) {
        msgEl.textContent = err;
        msgEl.style.color = 'var(--error)';
      } else {
        msgEl.textContent = 'Node added successfully.';
        msgEl.style.color = 'var(--primary)';
        this.$('new-node-label').value = '';
        this.$('new-node-target').checked = false;
        this.invalidateResults();
        this.refreshAll();
      }
    });

    this.$('form-add-edge').addEventListener('submit', (e) => {
      e.preventDefault();
      const from = this.$('edge-from').value;
      const to = this.$('edge-to').value;
      const cost = this.$('edge-cost').value;
      const directed = this.$('edge-directed').checked;

      const err = this.editor.addEdge(from, to, cost, directed);
      const msgEl = this.$('msg-edge');
      if (err) {
        msgEl.textContent = err;
        msgEl.style.color = 'var(--error)';
      } else {
        msgEl.textContent = 'Edge added successfully.';
        msgEl.style.color = 'var(--primary)';
        this.$('edge-cost').value = '';
        this.$('edge-directed').checked = false;
        this.invalidateResults();
        this.refreshAll();
      }
    });

    this.$('ed-btn-reset-sample').addEventListener('click', () => this.promptResetCurrentGraph());
    this.$('ed-btn-clear-graph').addEventListener('click', () => {
      const def = DEFAULT_ENVIRONMENTS[this.currentEnv];
      const envTitle = def ? def.name : this.editor.name;
      if (confirm(`Clear all nodes and edges from ${envTitle}?`)) {
        this.editor.clear();
        this.selectedId = null;
        this.startId = null;
        this.destId = null;
        this.invalidateResults();
        this.refreshAll();
      }
    });

    // 10. Engine Connection Diagnostics
    this.$('btn-test-engine').addEventListener('click', () => this.runEngineDiagnosticTest());
    this.$('btn-refresh-log').addEventListener('click', () => this.loadEngineLog());
  }

  promptResetCurrentGraph() {
    const def = DEFAULT_ENVIRONMENTS[this.currentEnv];
    const envTitle = def ? def.name : this.editor.name;
    if (!confirm(`Reset "${envTitle}" to its default graph? This will discard your edits for this environment only.`)) {
      return;
    }

    this.editor.load(def.nodes, def.edges, def.name, false);
    this.saveEnvironment(this.currentEnv);

    this.selectedId = null;
    if (this.editor.nodes.length >= 2) {
      this.startId = 0;
      this.destId = Math.min(2, this.editor.nodes.length - 1);
    } else {
      this.startId = null;
      this.destId = null;
    }

    this.invalidateResults();
    this.refreshAll();
    this.view.fitView(this.editor.nodes);
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update Sidebar Navigation active state
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update Topbar Title
    const titles = {
      overview: 'System Overview',
      route: 'Route Analysis',
      network: 'Network Analysis',
      editor: 'Graph Editor',
      engine: 'Engine Connection'
    };
    this.$('view-title').textContent = titles[viewName] || 'Graph Analysis';

    // Toggle Workspace & Right Panel vs Full Views
    const isFullEditor = viewName === 'editor';
    const isFullEngine = viewName === 'engine';

    this.$('workspace-card').style.display = (isFullEditor || isFullEngine) ? 'none' : 'flex';
    this.$('right-panel').style.display = (isFullEditor || isFullEngine) ? 'none' : 'flex';

    this.$('full-view-editor').classList.toggle('active', isFullEditor);
    this.$('full-view-engine').classList.toggle('active', isFullEngine);

    if (!isFullEditor && !isFullEngine) {
      this.$('panel-route').style.display = viewName === 'route' ? 'block' : 'none';
      this.$('panel-network').style.display = viewName === 'network' ? 'block' : 'none';
      this.$('panel-overview').style.display = viewName === 'overview' ? 'block' : 'none';
    }

    if (viewName === 'engine') {
      this.loadEngineLog();
    }

    this.renderGraph();
  }

  async checkEngineStatus() {
    const status = await this.api.getStatus();
    const pill = this.$('engine-status-pill');
    const text = this.$('engine-status-text');

    if (status.connected && status.engineReady) {
      this.engineConnected = true;
      pill.className = 'status-pill connected';
      text.textContent = 'C++ Engine Ready';
      this.$('diag-dosbox').innerHTML = `<span class="badge engine">Installed (${status.dosboxPath.split('\\').pop()})</span>`;
      this.$('diag-engine').innerHTML = `<span class="badge engine">Ready (ENGINE.EXE)</span>`;
    } else {
      this.engineConnected = false;
      pill.className = 'status-pill disconnected';
      text.textContent = status.connected ? 'Engine Missing' : 'Engine Offline';
      this.$('diag-dosbox').innerHTML = `<span class="badge stale">Not Detected</span>`;
      this.$('diag-engine').innerHTML = `<span class="badge stale">Not Compiled</span>`;
    }
  }

  handleNodeSelect(id) {
    this.selectedId = id;
    this.renderSelection();
    this.renderGraph();
  }

  renderSelection() {
    const node = this.editor.getNode(this.selectedId);
    const infoEl = this.$('selection-info');

    if (!node) {
      infoEl.innerHTML = '<span>No node selected. Click a node to inspect.</span>';
      ['btn-set-start', 'btn-set-dest', 'btn-toggle-target', 'btn-clear-sel'].forEach(id => {
        this.$(id).disabled = true;
      });
      return;
    }

    const targetBadge = node.isTarget ? '<span class="badge" style="background:#DEE7E1; color:var(--primary);">Target</span>' : '';
    infoEl.innerHTML = `<span>Selected: <b>Node ${node.id}</b> (${node.label.replace(/_/g, ' ')}) ${targetBadge}</span>`;

    ['btn-set-start', 'btn-set-dest', 'btn-toggle-target', 'btn-clear-sel'].forEach(id => {
      this.$(id).disabled = false;
    });
  }

  invalidateResults() {
    if (this.activeResult) {
      this.activeResult.isStale = true;

      const routeContainer = this.$('route-result-container');
      if (routeContainer && routeContainer.querySelector('.result-box')) {
        routeContainer.innerHTML = `
          <div class="result-box">
            <div class="result-header"><span class="badge stale">Outdated Result</span></div>
            <p class="hint-text">The graph was modified after this route was computed. Click "Find Route" to calculate on the updated graph.</p>
          </div>`;
      }

      const netContainer = this.$('network-result-container');
      if (netContainer && netContainer.querySelector('.result-box')) {
        netContainer.innerHTML = `
          <div class="result-box">
            <div class="result-header"><span class="badge stale">Outdated Result</span></div>
            <p class="hint-text">The graph was modified after this analysis was computed. Run the operation again to see updated results.</p>
          </div>`;
      }

      this.renderGraph();
    }
  }

  refreshAll() {
    this.syncDropdowns();
    this.updateMetrics();
    this.renderTables();
    this.renderGraph();
    this.renderSelection();
  }

  syncDropdowns() {
    const nodes = this.editor.nodes;
    const nodeOptions = nodes.map(n => `<option value="${n.id}">${n.id} · ${n.label.replace(/_/g, ' ')}</option>`).join('');

    // Route Selects
    this.$('route-from').innerHTML = nodeOptions;
    this.$('route-to').innerHTML = nodeOptions;
    this.$('nearest-from').innerHTML = nodeOptions;

    if (this.startId !== null && this.editor.getNode(this.startId)) {
      this.$('route-from').value = this.startId;
      this.$('nearest-from').value = this.startId;
    } else if (nodes.length > 0) {
      this.startId = nodes[0].id;
      this.$('route-from').value = this.startId;
      this.$('nearest-from').value = this.startId;
    }

    if (this.destId !== null && this.editor.getNode(this.destId)) {
      this.$('route-to').value = this.destId;
    } else if (nodes.length > 1) {
      this.destId = nodes[1].id;
      this.$('route-to').value = this.destId;
    }

    // Network Selects
    this.$('net-block-from').innerHTML = nodeOptions;
    this.$('net-block-to').innerHTML = nodeOptions;
    if (nodes.length > 0) {
      this.$('net-block-from').value = this.startId !== null ? this.startId : nodes[0].id;
      this.$('net-block-to').value = this.destId !== null ? this.destId : (nodes.length > 1 ? nodes[1].id : nodes[0].id);
    }

    this.$('net-isolate-node').innerHTML = nodeOptions;
    this.$('net-isolate-ref').innerHTML = nodeOptions;
    if (nodes.length >= 2) {
      this.$('net-isolate-node').selectedIndex = 0;
      this.$('net-isolate-ref').selectedIndex = 1;
    }

    // Edge block select
    const edgeOptions = this.editor.edges.map(e => {
      const u = this.editor.getNode(e.from);
      const v = this.editor.getNode(e.to);
      const uLbl = u ? u.label.replace(/_/g, ' ') : e.from;
      const vLbl = v ? v.label.replace(/_/g, ' ') : e.to;
      const blk = e.blocked ? ' (blocked)' : '';
      return `<option value="${e.from}-${e.to}">${e.from}–${e.to} [${uLbl} → ${vLbl}, cost ${e.cost}]${blk}</option>`;
    }).join('');
    this.$('net-block-edge').innerHTML = edgeOptions;

    // Edge creation selects
    this.$('edge-from').innerHTML = nodeOptions;
    this.$('edge-to').innerHTML = nodeOptions;
    if (nodes.length >= 2) {
      this.$('edge-to').selectedIndex = 1;
    }

    this.$('new-node-id').value = this.editor.nextId();
  }

  updateMetrics() {
    const n = this.editor.nodes.length;
    const m = this.editor.edges.length;
    const b = this.editor.edges.filter(e => e.blocked).length;
    const t = this.editor.nodes.filter(n => n.isTarget).length;

    this.$('stat-nodes').textContent = n;
    this.$('stat-edges').textContent = m;
    this.$('stat-blocked').textContent = b;
    this.$('stat-targets').textContent = t;

    // Header badge updated dynamically with active environment name
    this.$('graph-name-chip').textContent = this.editor.name;
  }

  renderTables() {
    // 1. Nodes Table
    const tbodyNodes = this.$('table-nodes').querySelector('tbody');
    tbodyNodes.innerHTML = this.editor.nodes.map(n => `
      <tr>
        <td class="mono"><b>${n.id}</b></td>
        <td>${n.label.replace(/_/g, ' ')}</td>
        <td>${n.isTarget ? '<span class="badge engine">Target</span>' : '—'}</td>
        <td>
          <button class="sm danger" onclick="app.removeNode(${n.id})">Delete</button>
        </td>
      </tr>
    `).join('');

    // 2. Edges Table
    const tbodyEdges = this.$('table-edges').querySelector('tbody');
    tbodyEdges.innerHTML = this.editor.edges.map(e => `
      <tr>
        <td class="mono"><b>${e.from}</b></td>
        <td class="mono"><b>${e.to}</b></td>
        <td>${e.cost}</td>
        <td>${e.directed ? '1-way' : '2-way'}</td>
        <td>${e.blocked ? '<span class="badge stale">Blocked</span>' : '<span class="badge engine">Open</span>'}</td>
        <td style="display:flex; gap:6px;">
          <button class="sm" onclick="app.toggleEdgeBlocked(${e.from}, ${e.to})">${e.blocked ? 'Unblock' : 'Block'}</button>
          <button class="sm danger" onclick="app.removeEdge(${e.from}, ${e.to})">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  removeNode(id) {
    if (confirm(`Delete Node ${id}? Remaining nodes will be automatically renumbered to preserve contiguous 0..N-1 ordering.`)) {
      this.editor.removeNode(id);
      if (this.selectedId === id) this.selectedId = null;
      if (this.startId === id) this.startId = null;
      if (this.destId === id) this.destId = null;
      this.invalidateResults();
      this.refreshAll();
    }
  }

  removeEdge(from, to) {
    if (confirm(`Delete edge ${from}–${to}?`)) {
      this.editor.removeEdge(from, to);
      this.invalidateResults();
      this.refreshAll();
    }
  }

  toggleEdgeBlocked(from, to) {
    this.editor.toggleBlocked(from, to);
    this.invalidateResults();
    this.refreshAll();
  }

  renderGraph() {
    const r = this.activeResult;
    const isCurrent = r && !r.isStale && r.graphVersion === this.editor.version && r.envKey === this.currentEnv;

    let routePath = [];
    let criticalNodes = [];
    let bridgeEdges = [];
    let targetIds = [];

    if (isCurrent && r.parsed) {
      if (r.command === 'ROUTE' || r.command === 'STEPS') {
        routePath = r.parsed.path || [];
      } else if (r.command === 'NEAREST') {
        if (r.parsed.nearest !== null && r.parsed.nearest !== undefined) {
          targetIds = [r.parsed.nearest];
        }
      } else if (r.command === 'BLOCK') {
        routePath = r.parsed.after || [];
      } else if (r.command === 'CRITICAL') {
        criticalNodes = r.parsed.criticalNodes || [];
        bridgeEdges = r.parsed.bridges || [];
      }
    }

    this.view.render({
      nodes: this.editor.nodes,
      edges: this.editor.edges,
      selectedId: this.selectedId,
      startId: this.startId,
      destId: this.destId,
      routePath,
      targetIds,
      criticalNodes,
      bridgeEdges
    });
  }

  // ---- Real Engine Operations (Executed via 16-bit C++ Backend) ----

  async runRouteAnalysis() {
    const mode = this.$('route-mode-select').value;
    const container = this.$('route-result-container');
    const btn = this.$('btn-run-route');

    if (mode === 'point-to-point') {
      const from = Number(this.$('route-from').value);
      const to = Number(this.$('route-to').value);
      const strategy = this.$('route-strategy').value;

      if (from === to) {
        container.innerHTML = '<div class="result-box error"><p>Start and destination must be different nodes.</p></div>';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Executing on C++ Engine...';
      this.$('stat-last-op').textContent = 'Executing...';

      const cmd = strategy === 'BFS' ? 'STEPS' : 'ROUTE';
      const reqEnv = this.currentEnv;
      const reqVersion = this.editor.version;

      const res = await this.api.analyze(
        { nodes: this.editor.nodes, edges: this.editor.edges },
        cmd,
        [from, to],
        reqVersion,
        reqEnv
      );

      btn.disabled = false;
      btn.textContent = 'Find Route';

      // Staleness / Environment Race Check
      if (!res.isLatest || this.currentEnv !== reqEnv || this.editor.version !== reqVersion) {
        return;
      }

      this.activeResult = {
        command: cmd,
        parsed: res.parsed,
        graphVersion: reqVersion,
        envKey: reqEnv,
        isStale: false,
        execMs: res.executionMs,
        lastLog: res.lastLog
      };

      this.renderRouteResult(res.parsed, from, to, strategy, res.executionMs);
      
      const secStr = (res.executionMs / 1000).toFixed(2);
      this.$('stat-last-op').textContent = `Route · ${secStr} s (engine time)`;
      this.renderGraph();
    } else {
      // Nearest Target
      const from = Number(this.$('nearest-from').value);
      const targets = this.editor.nodes.filter(n => n.isTarget).map(n => n.id);

      if (targets.length === 0) {
        container.innerHTML = '<div class="result-box error"><p>No Target nodes found. Mark at least one node as Target (Toggle Target) in this environment first.</p></div>';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Searching Nearest on Engine...';

      const reqEnv = this.currentEnv;
      const reqVersion = this.editor.version;

      const res = await this.api.analyze(
        { nodes: this.editor.nodes, edges: this.editor.edges },
        'NEAREST',
        [from, ...targets],
        reqVersion,
        reqEnv
      );

      btn.disabled = false;
      btn.textContent = 'Find Nearest Target';

      // Staleness / Environment Race Check
      if (!res.isLatest || this.currentEnv !== reqEnv || this.editor.version !== reqVersion) {
        return;
      }

      this.activeResult = {
        command: 'NEAREST',
        parsed: res.parsed,
        graphVersion: reqVersion,
        envKey: reqEnv,
        isStale: false,
        execMs: res.executionMs
      };

      this.renderNearestResult(res.parsed, from, res.executionMs);
      const secStr = (res.executionMs / 1000).toFixed(2);
      this.$('stat-last-op').textContent = `Nearest · ${secStr} s (engine time)`;
      this.renderGraph();
    }
  }

  renderRouteResult(parsed, from, to, strategy, ms) {
    const container = this.$('route-result-container');

    if (parsed.status !== 'OK') {
      container.innerHTML = `
        <div class="result-box error">
          <div class="result-header">
            <span class="badge" style="background:#EABCB7; color:var(--error);">Engine Error</span>
          </div>
          <p style="font-size:12.5px;">${parsed.message || 'Operation failed.'}</p>
        </div>`;
      return;
    }

    if (!parsed.path || parsed.path.length === 0) {
      container.innerHTML = `
        <div class="result-box">
          <div class="result-header">
            <span class="badge engine">C++ Engine Output</span>
            <span class="mono" style="font-size:11px;">${(ms/1000).toFixed(2)} s</span>
          </div>
          <p>No valid path exists between Node ${from} and Node ${to}.</p>
        </div>`;
      return;
    }

    const chips = parsed.path.map(id => {
      const n = this.editor.getNode(id);
      const name = n ? n.label.replace(/_/g, ' ') : `Node ${id}`;
      return `<span class="node-chip"><b>${id}</b> ${name}</span>`;
    }).join('<span class="route-arrow"> → </span>');

    const costLabel = strategy === 'BFS' ? 'Fewest Steps' : 'Total Cost';
    const costValue = strategy === 'BFS' ? parsed.steps : parsed.cost;

    container.innerHTML = `
      <div class="result-box">
        <div class="result-header">
          <span class="badge engine">C++ Engine Output</span>
          <span class="mono" style="font-size:11.5px; color:var(--text-muted);">${(ms/1000).toFixed(2)} s</span>
        </div>
        <div class="route-chain">${chips}</div>
        <table class="stats-table">
          <tr><td>Strategy</td><td>${strategy === 'BFS' ? 'BFS (Fewest Steps)' : 'Dijkstra (Lowest Cost)'}</td></tr>
          <tr><td>${costLabel}</td><td class="mono" style="color:var(--primary); font-size:14px;">${costValue}</td></tr>
          <tr><td>Edges Traversed</td><td class="mono">${parsed.path.length - 1}</td></tr>
          <tr><td>Execution Time</td><td class="mono">${ms} ms (engine time)</td></tr>
        </table>
      </div>`;
  }

  renderNearestResult(parsed, from, ms) {
    const container = this.$('route-result-container');

    if (parsed.status !== 'OK') {
      container.innerHTML = `<div class="result-box error"><p>${parsed.message}</p></div>`;
      return;
    }

    if (parsed.nearest === null || parsed.nearest === undefined) {
      container.innerHTML = `
        <div class="result-box">
          <div class="result-header"><span class="badge engine">C++ Output</span></div>
          <p>No marked target node is reachable from Node ${from}.</p>
        </div>`;
      return;
    }

    const tNode = this.editor.getNode(parsed.nearest);
    const tName = tNode ? tNode.label.replace(/_/g, ' ') : `Node ${parsed.nearest}`;

    container.innerHTML = `
      <div class="result-box">
        <div class="result-header">
          <span class="badge engine">C++ Engine Output</span>
          <span class="mono" style="font-size:11.5px;">${(ms/1000).toFixed(2)} s</span>
        </div>
        <p style="font-size:12.5px; margin-bottom:6px;">Nearest Target identified via BFS traversal:</p>
        <div class="route-chain">
          <span class="node-chip" style="border-color:var(--primary);"><b>${parsed.nearest}</b> ${tName}</span>
        </div>
        <table class="stats-table" style="margin-top:8px;">
          <tr><td>Search Algorithm</td><td>BFS Early-Exit Queue</td></tr>
          <tr><td>Origin Node</td><td>${from}</td></tr>
          <tr><td>Execution Time</td><td class="mono">${ms} ms</td></tr>
        </table>
      </div>`;
  }

  async runBlockSimulation() {
    const from = Number(this.$('net-block-from').value);
    const to = Number(this.$('net-block-to').value);
    const edgeVal = this.$('net-block-edge').value;

    if (!edgeVal) {
      alert('Please select an edge to simulate closure.');
      return;
    }

    const [blockA, blockB] = edgeVal.split('-').map(Number);
    const btn = this.$('btn-run-block');
    const container = this.$('network-result-container');

    btn.disabled = true;
    btn.textContent = 'Simulating on Engine...';

    const reqEnv = this.currentEnv;
    const reqVersion = this.editor.version;

    const res = await this.api.analyze(
      { nodes: this.editor.nodes, edges: this.editor.edges },
      'BLOCK',
      [from, to, blockA, blockB],
      reqVersion,
      reqEnv
    );

    btn.disabled = false;
    btn.textContent = 'Simulate Closure';

    if (!res.isLatest || this.currentEnv !== reqEnv || this.editor.version !== reqVersion) {
      return;
    }

    this.activeResult = {
      command: 'BLOCK',
      parsed: res.parsed,
      graphVersion: reqVersion,
      envKey: reqEnv,
      isStale: false,
      execMs: res.executionMs
    };

    if (res.parsed.status !== 'OK') {
      container.innerHTML = `<div class="result-box error"><p>${res.parsed.message}</p></div>`;
      return;
    }

    const beforeChain = (res.parsed.before || []).map(id => {
      const n = this.editor.getNode(id);
      return `<b>${id}</b>${n ? ` (${n.label.replace(/_/g, ' ')})` : ''}`;
    }).join(' → ') || 'None';

    const afterChain = (res.parsed.after || []).map(id => {
      const n = this.editor.getNode(id);
      return `<b>${id}</b>${n ? ` (${n.label.replace(/_/g, ' ')})` : ''}`;
    }).join(' → ') || 'No alternative path (Disconnected)';

    container.innerHTML = `
      <div class="result-box">
        <div class="result-header">
          <span class="badge engine">Closure Simulation</span>
          <span class="mono" style="font-size:11.5px;">${(res.executionMs/1000).toFixed(2)} s</span>
        </div>
        <p style="font-size:12px;">Simulating closing edge <b>${blockA}–${blockB}</b>:</p>
        <div style="font-size:12.5px; margin: 6px 0;">
          <div><b>Before Closure:</b> ${beforeChain}</div>
          <div style="margin-top:6px; color:var(--primary);"><b>After Closure:</b> ${afterChain}</div>
        </div>
        <table class="stats-table">
          <tr><td>Original Hops</td><td class="mono">${(res.parsed.before || []).length - 1}</td></tr>
          <tr><td>Rerouted Hops</td><td class="mono">${(res.parsed.after || []).length ? (res.parsed.after.length - 1) : 'Disconnected'}</td></tr>
        </table>
      </div>`;

    const secStr = (res.executionMs / 1000).toFixed(2);
    this.$('stat-last-op').textContent = `Block · ${secStr} s (engine time)`;
    this.renderGraph();
  }

  async runCriticalScan() {
    const btn = this.$('btn-run-critical');
    const container = this.$('network-result-container');

    btn.disabled = true;
    btn.textContent = 'Scanning Tarjan Weak Points...';

    const reqEnv = this.currentEnv;
    const reqVersion = this.editor.version;

    const res = await this.api.analyze(
      { nodes: this.editor.nodes, edges: this.editor.edges },
      'CRITICAL',
      [],
      reqVersion,
      reqEnv
    );

    btn.disabled = false;
    btn.textContent = 'Find Critical Points';

    if (!res.isLatest || this.currentEnv !== reqEnv || this.editor.version !== reqVersion) {
      return;
    }

    this.activeResult = {
      command: 'CRITICAL',
      parsed: res.parsed,
      graphVersion: reqVersion,
      envKey: reqEnv,
      isStale: false,
      execMs: res.executionMs
    };

    if (res.parsed.status !== 'OK') {
      container.innerHTML = `<div class="result-box error"><p>${res.parsed.message}</p></div>`;
      return;
    }

    const nodesList = res.parsed.criticalNodes.length
      ? res.parsed.criticalNodes.map(id => {
          const n = this.editor.getNode(id);
          return `<span class="node-chip" style="border-color:var(--warning);"><b>${id}</b> ${n ? n.label.replace(/_/g, ' ') : ''}</span>`;
        }).join(' ')
      : 'None (Biconnected)';

    const bridgesList = res.parsed.bridges.length
      ? res.parsed.bridges.map(b => `<span class="node-chip" style="border-color:var(--warning); font-family:var(--font-mono);">${b}</span>`).join(' ')
      : 'None';

    container.innerHTML = `
      <div class="result-box">
        <div class="result-header">
          <span class="badge engine">Critical Points Scan</span>
          <span class="mono" style="font-size:11.5px;">${(res.executionMs/1000).toFixed(2)} s</span>
        </div>
        <p class="hint-text">Articulation nodes whose removal increases connected components:</p>
        <div style="margin: 6px 0;">${nodesList}</div>
        <p class="hint-text" style="margin-top:8px;">Bridges (critical connections):</p>
        <div style="margin: 6px 0;">${bridgesList}</div>
      </div>`;

    const secStr = (res.executionMs / 1000).toFixed(2);
    this.$('stat-last-op').textContent = `Critical · ${secStr} s (engine time)`;
    this.renderGraph();
  }

  async runIsolationImpact() {
    const node = Number(this.$('net-isolate-node').value);
    const ref = Number(this.$('net-isolate-ref').value);
    const container = this.$('network-result-container');
    const btn = this.$('btn-run-isolate');

    if (node === ref) {
      container.innerHTML = '<div class="result-box error"><p>Failing node and reference observer node must be different.</p></div>';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Calculating Reachability...';

    const reqEnv = this.currentEnv;
    const reqVersion = this.editor.version;

    const res = await this.api.analyze(
      { nodes: this.editor.nodes, edges: this.editor.edges },
      'ISOLATE',
      [node, ref],
      reqVersion,
      reqEnv
    );

    btn.disabled = false;
    btn.textContent = 'Calculate Isolation Impact';

    if (!res.isLatest || this.currentEnv !== reqEnv || this.editor.version !== reqVersion) {
      return;
    }

    if (res.parsed.status !== 'OK') {
      container.innerHTML = `<div class="result-box error"><p>${res.parsed.message}</p></div>`;
      return;
    }

    const impact = res.parsed.impact;
    const nodeObj = this.editor.getNode(node);
    const refObj = this.editor.getNode(ref);
    const nodeName = nodeObj ? nodeObj.label.replace(/_/g, ' ') : `Node ${node}`;
    const refName = refObj ? refObj.label.replace(/_/g, ' ') : `Node ${ref}`;

    container.innerHTML = `
      <div class="result-box">
        <div class="result-header">
          <span class="badge engine">Isolation Reachability</span>
          <span class="mono" style="font-size:11.5px;">${(res.executionMs/1000).toFixed(2)} s</span>
        </div>
        <p style="font-size:13px;">If <b>Node ${node} (${nodeName})</b> fails:</p>
        <div style="font-size:24px; font-weight:700; color:var(--error); margin: 6px 0;">
          ${impact} ${impact === 1 ? 'node' : 'nodes'}
        </div>
        <p class="hint-text">other nodes lose connection to the reference observer (Node ${ref}: ${refName}).</p>
      </div>`;

    const secStr = (res.executionMs / 1000).toFixed(2);
    this.$('stat-last-op').textContent = `Isolate · ${secStr} s (engine time)`;
  }

  // ---- Isolated Diagnostic Engine Test ----

  async runEngineDiagnosticTest() {
    const btn = this.$('btn-test-engine');
    const resBox = this.$('diag-test-result');

    btn.disabled = true;
    btn.textContent = 'Executing Test on DOSBox...';
    resBox.innerHTML = '<p class="hint-text">Running live test: ENGINE ROUTE 0 3...</p>';

    // Isolated test graph: guaranteed valid, doesn't mutate or corrupt active environment state
    const diagGraph = {
      nodes: [
        { id: 0, label: 'Test_Node_0' },
        { id: 1, label: 'Test_Node_1' },
        { id: 2, label: 'Test_Node_2' },
        { id: 3, label: 'Test_Node_3' }
      ],
      edges: [
        { from: 0, to: 1, cost: 70, directed: 0, blocked: false },
        { from: 1, to: 2, cost: 75, directed: 0, blocked: false },
        { from: 2, to: 3, cost: 50, directed: 0, blocked: false },
        { from: 0, to: 3, cost: 110, directed: 0, blocked: false }
      ]
    };

    const res = await this.api.analyze(
      diagGraph,
      'ROUTE',
      [0, 3],
      -1,
      'diagnostic'
    );

    btn.disabled = false;
    btn.textContent = 'Run Live Engine Diagnostic Test (ROUTE 0 3)';

    if (res.httpOk && res.parsed && res.parsed.status === 'OK') {
      resBox.innerHTML = `
        <div class="result-box" style="border-color:var(--primary);">
          <div class="result-header">
            <span class="badge engine">Test Successful</span>
            <span class="mono">${(res.executionMs/1000).toFixed(2)} s</span>
          </div>
          <pre class="mono" style="font-size:11px; margin-top:6px;">${res.rawResult.trim()}</pre>
          <p class="hint-text" style="margin-top:6px;">Log: ${res.lastLog}</p>
        </div>`;
    } else {
      resBox.innerHTML = `
        <div class="result-box error">
          <div class="result-header"><span class="badge" style="color:var(--error);">Failed</span></div>
          <p style="font-size:12px;">${res.message || 'Execution error'}</p>
        </div>`;
    }

    this.loadEngineLog();
  }

  async loadEngineLog() {
    const logData = await this.api.getLog();
    const viewer = this.$('log-viewer');
    if (logData.entries && logData.entries.length) {
      viewer.textContent = logData.entries.slice(-15).join('\n');
      viewer.scrollTop = viewer.scrollHeight;
    } else {
      viewer.textContent = 'No log entries found in LOG.TXT yet.';
    }
  }

  exportGraphFile() {
    const text = FileBridge.serializeGraph(this.editor.nodes, this.editor.edges);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GRAPH_${this.currentEnv.toUpperCase()}.TXT`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Global instance
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new CritiPathApp();
});
