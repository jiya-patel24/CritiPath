#ifndef ANALYSIS_H
#define ANALYSIS_H

#include "GRAPH.H"

// Room for the biggest answer: up to MAX_NODES bridges, 2 numbers each.
const int MAX_RESULT = 2 * MAX_NODES;

// 1 if there is an edge between u and v in EITHER direction.
// Analysis ignores edge direction. Assumes no duplicate edges.
int isLinked(Graph &g, int u, int v)
{
    if (g.getWeight(u, v) != -1)
        return 1;
    if (g.getWeight(v, u) != -1)
        return 1;
    return 0;
}

// ================== ANALYSIS STRATEGY (ABSTRACT BASE) ==================
// Returns 0 on success, -1 on invalid graph (empty or too big).
// outCount = how many results were found.
//   ArticulationStrategy: outResult[0..count-1] = node ids
//   BridgeStrategy:       outResult = pairs  from0,to0,from1,to1,...
//                         (so the array must hold MAX_RESULT ints)
class AnalysisStrategy
{
    public:
        virtual int analyze(Graph &g, int outResult[], int &outCount) = 0;
        virtual ~AnalysisStrategy() {}
};

// ================== ARTICULATION POINTS ==================
class ArticulationStrategy : public AnalysisStrategy
{
    private:
        int disc[MAX_NODES];
        int low[MAX_NODES];
        int visited[MAX_NODES];
        int isCut[MAX_NODES];
        int timeCounter;

        // Visit node u. parent = the node we came from (-1 for a start node).
        void dfs(Graph &g, int u, int parent)
        {
            int n = g.getNumNodes();
            int v;
            int childCount = 0;

            visited[u] = 1;
            timeCounter++;
            disc[u] = timeCounter;
            low[u] = timeCounter;

            for (v = 0; v < n; v++)
            {
                if (isLinked(g, u, v) && v != parent)
                {
                    if (!visited[v])
                    {
                        // v is a new node: go deeper
                        childCount++;
                        dfs(g, v, u);

                        if (low[v] < low[u])
                            low[u] = low[v];

                        // branch under v cannot climb above u
                        if (parent != -1 && low[v] >= disc[u])
                            isCut[u] = 1;
                    }
                    else
                    {
                        // v already visited: a shortcut edge
                        if (disc[v] < low[u])
                            low[u] = disc[v];
                    }
                }
            }

            // a start node is critical only with 2+ separate branches
            if (parent == -1 && childCount >= 2)
                isCut[u] = 1;
        }

    public:
        int analyze(Graph &g, int outResult[], int &outCount)
        {
            int n = g.getNumNodes();
            int i;
            outCount = 0;

            if (n <= 0 || n > MAX_NODES)
                return -1;

            for (i = 0; i < n; i++)
            {
                visited[i] = 0;
                isCut[i] = 0;
            }
            timeCounter = 0;

            // start a DFS from every unvisited node (graph may be in pieces)
            for (i = 0; i < n; i++)
            {
                if (!visited[i])
                    dfs(g, i, -1);
            }

            for (i = 0; i < n; i++)
            {
                if (isCut[i] == 1)
                {
                    outResult[outCount] = i;
                    outCount++;
                }
            }
            return 0;
        }
};

// ================== BRIDGES ==================
class BridgeStrategy : public AnalysisStrategy
{
    private:
        int disc[MAX_NODES];
        int low[MAX_NODES];
        int visited[MAX_NODES];
        int bridgeFrom[MAX_NODES];
        int bridgeTo[MAX_NODES];
        int bridgeCount;
        int timeCounter;

        void dfs(Graph &g, int u, int parent)
        {
            int n = g.getNumNodes();
            int v;

            visited[u] = 1;
            timeCounter++;
            disc[u] = timeCounter;
            low[u] = timeCounter;

            for (v = 0; v < n; v++)
            {
                if (isLinked(g, u, v) && v != parent)
                {
                    if (!visited[v])
                    {
                        dfs(g, v, u);

                        if (low[v] < low[u])
                            low[u] = low[v];

                        // branch under v cannot get back to u or above
                        if (low[v] > disc[u])
                        {
                            bridgeFrom[bridgeCount] = u;
                            bridgeTo[bridgeCount] = v;
                            bridgeCount++;
                        }
                    }
                    else
                    {
                        if (disc[v] < low[u])
                            low[u] = disc[v];
                    }
                }
            }
        }

    public:
        int analyze(Graph &g, int outResult[], int &outCount)
        {
            int n = g.getNumNodes();
            int i;
            outCount = 0;

            if (n <= 0 || n > MAX_NODES)
                return -1;

            for (i = 0; i < n; i++)
                visited[i] = 0;
            timeCounter = 0;
            bridgeCount = 0;

            for (i = 0; i < n; i++)
            {
                if (!visited[i])
                    dfs(g, i, -1);
            }

            for (i = 0; i < bridgeCount; i++)
            {
                outResult[2 * i]     = bridgeFrom[i];
                outResult[2 * i + 1] = bridgeTo[i];
            }
            outCount = bridgeCount;
            return 0;
        }
};

// ---------- ISOLATION IMPACT ----------
// Counts nodes reachable from start, pretending skipNode does not exist.
// Pass skipNode = -1 to skip nothing.
int countReachable(Graph &g, int start, int skipNode)
{
    int n = g.getNumNodes();
    if (n > MAX_NODES) n = MAX_NODES;
    if (start == skipNode || start < 0 || start >= n)
        return 0;

    int visited[MAX_NODES];
    int queueArr[MAX_NODES];
    int front = 0, rear = 0;
    int count = 0;
    int i, current, neighbor;

    for (i = 0; i < MAX_NODES; i++)
        visited[i] = 0;

    queueArr[rear++] = start;
    visited[start] = 1;

    while (front < rear)
    {
        current = queueArr[front++];
        count++;
        for (neighbor = 0; neighbor < n; neighbor++)
        {
            if (neighbor != skipNode && !visited[neighbor] &&
                g.getWeight(current, neighbor) != -1)
            {
                visited[neighbor] = 1;
                queueArr[rear++] = neighbor;
            }
        }
    }
    return count;
}

// Returns how many OTHER nodes get cut off from referenceStartNode
// if nodeToRemove disappears. Returns -1 on invalid input.
// Graph is NOT modified.
int isolationImpact(Graph &g, int nodeToRemove, int referenceStartNode)
{
    int n = g.getNumNodes();
    if (nodeToRemove < 0 || nodeToRemove >= n ||
        referenceStartNode < 0 || referenceStartNode >= n ||
        nodeToRemove == referenceStartNode)
        return -1;

    int before = countReachable(g, referenceStartNode, -1);
    int after  = countReachable(g, referenceStartNode, nodeToRemove);

    // extra -1: the removed node itself is not "cut off", it is gone
    return before - after - 1;
}

#endif