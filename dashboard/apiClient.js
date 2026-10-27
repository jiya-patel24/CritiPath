/**
 * CritiPath API Client
 * ---------------------
 * Handles all HTTP communication between the dashboard and the local Python server adapter.
 * Encapsulates status checks, graph analysis requests, and log streaming.
 * Includes request versioning to ignore stale responses after graph edits.
 */

class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.activeRequestId = 0;
  }

  /**
   * Fetches the real-time engine and DOSBox status.
   */
  async getStatus() {
    try {
      const res = await fetch(`${this.baseUrl}/api/status`, { cache: 'no-store' });
      if (!res.ok) {
        return { connected: false, error: `HTTP ${res.status}: Server unreachable` };
      }
      return await res.json();
    } catch (err) {
      return { connected: false, error: `Connection failed: ${err.message}` };
    }
  }

  /**
   * Fetches the default demonstration graph for an environment ('campus', 'hospital', 'mall').
   */
  async getSampleGraph(env = 'campus') {
    try {
      const res = await fetch(`${this.baseUrl}/api/sample?env=${encodeURIComponent(env)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Could not load sample for ${env} from server, using fallback`, err);
      return null;
    }
  }

  /**
   * Fetches the engine LOG.TXT history.
   */
  async getLog() {
    try {
      const res = await fetch(`${this.baseUrl}/api/log`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { entries: [], error: err.message };
    }
  }

  /**
   * Sends the current graph and an analysis command to the engine.
   * Tracks requestId so callers can discard obsolete responses.
   * 
   * @param {Object} graph - { nodes: [...], edges: [...] }
   * @param {string} command - "ROUTE" | "STEPS" | "NEAREST" | "BLOCK" | "ISOLATE" | "CRITICAL"
   * @param {Array<number|string>} args - Command arguments
   * @param {number} graphVersion - Client-side graph version for staleness detection
   * @param {string} env - Environment identifier ('campus', 'hospital', 'mall')
   */
  async analyze(graph, command, args, graphVersion, env = 'campus') {
    const requestId = ++this.activeRequestId;

    try {
      const res = await fetch(`${this.baseUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph, command, args, env, graphVersion })
      });

      const data = await res.json();
      return {
        requestId,
        env,
        graphVersion,
        isLatest: requestId === this.activeRequestId,
        httpOk: res.ok,
        ...data
      };
    } catch (err) {
      return {
        requestId,
        env,
        graphVersion,
        isLatest: requestId === this.activeRequestId,
        status: 'ERROR',
        httpOk: false,
        message: `Network or server error: ${err.message}`,
        parsed: { status: 'ERROR', message: err.message }
      };
    }
  }
}
