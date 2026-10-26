#ifndef PATHFIND_H
#define PATHFIND_H

#include <iostream.h>
#include "GRAPH.H"

// "Infinity" for Dijkstra. Costs must be non-negative and below this value.
const float INF_COST = 9999;

// ================== PATHFINDING STRATEGY (ABSTRACT BASE) ==================
// Returns: BFS -> number of steps, Dijkstra -> total cost, -1 if no path
// or if the input is invalid. The path is written to outPath[].
class PathfindingStrategy
{
    public:
        virtual float findPath(Graph &g, int source, int destination,
                               int outPath[], int &outPathLength) = 0;
        virtual ~PathfindingStrategy() {}
};

// ================== BFS STRATEGY ==================
class BFSStrategy : public PathfindingStrategy
{
    public:
        float findPath(Graph &g, int source, int destination,
                       int outPath[], int &outPathLength)
        {
            int n = g.getNumNodes();
            outPathLength = 0;

            if (n > MAX_NODES || source < 0 || source >= n ||
                destination < 0 || destination >= n)
                return -1;

            int visited[MAX_NODES];
            int parent[MAX_NODES];

            int i;
            for (i = 0; i < n; i++)
            {
                visited[i] = 0;
                parent[i] = -1;
            }

            int queueArr[MAX_NODES];
            int front = 0, rear = 0;

            queueArr[rear++] = source;
            visited[source] = 1;

            while (front < rear)
            {
                int current = queueArr[front++];
                if (current == destination)
                    break;

                int neighbor;
                for (neighbor = 0; neighbor < n; neighbor++)
                {
                    if (g.getWeight(current, neighbor) != -1 && !visited[neighbor])
                    {
                        visited[neighbor] = 1;
                        parent[neighbor] = current;
                        queueArr[rear++] = neighbor;
                    }
                }
            }

            if (!visited[destination])
                return -1;

            int temp[MAX_NODES];
            int count = 0;
            int node = destination;
            while (node != -1)
            {
                temp[count++] = node;
                node = parent[node];
            }

            outPathLength = count;
            for (i = 0; i < count; i++)
                outPath[i] = temp[count - 1 - i];

            return count - 1;
        }
};

// ================== DIJKSTRA STRATEGY ==================
class DijkstraStrategy : public PathfindingStrategy
{
    public:
        float findPath(Graph &g, int source, int destination,
                       int outPath[], int &outPathLength)
        {
            int n = g.getNumNodes();
            outPathLength = 0;

            if (n > MAX_NODES || source < 0 || source >= n ||
                destination < 0 || destination >= n)
                return -1;

            float dist[MAX_NODES];           // was int: now float
            int visited[MAX_NODES];
            int parent[MAX_NODES];

            int i;
            for (i = 0; i < n; i++)
            {
                dist[i] = INF_COST;
                visited[i] = 0;
                parent[i] = -1;
            }
            dist[source] = 0;

            int count;
            for (count = 0; count < n - 1; count++)
            {
                // find closest unvisited node
                int u = -1;
                float minDist = INF_COST;
                for (i = 0; i < n; i++)
                {
                    if (!visited[i] && dist[i] < minDist)
                    {
                        minDist = dist[i];
                        u = i;
                    }
                }

                if (u == -1)
                    break;   // remaining nodes unreachable

                visited[u] = 1;

                // relax neighbors of u
                int v;
                for (v = 0; v < n; v++)
                {
                    float weight = g.getWeight(u, v);
                    if (weight != -1 && !visited[v] && dist[u] + weight < dist[v])
                    {
                        dist[v] = dist[u] + weight;   // (int) cast removed
                        parent[v] = u;
                    }
                }
            }

            if (dist[destination] >= INF_COST)
                return -1;

            int temp[MAX_NODES];
            int cnt = 0;
            int node = destination;
            while (node != -1)
            {
                temp[cnt++] = node;
                node = parent[node];
            }

            outPathLength = cnt;
            for (i = 0; i < cnt; i++)
                outPath[i] = temp[cnt - 1 - i];

            return dist[destination];
        }
};

// ---------- NEAREST TARGET (fewest steps) ----------
// Returns node id of nearest target, or -1 if none reachable.
// A start node that is itself a target returns itself.
int findNearestTarget(Graph &g, int startNode, int isTarget[])
{
    int n = g.getNumNodes();
    if (n > MAX_NODES) n = MAX_NODES;
    if (startNode < 0 || startNode >= n)
        return -1;

    int visited[MAX_NODES];
    int queueArr[MAX_NODES];
    int front = 0, rear = 0;
    int i, current, neighbor;

    for (i = 0; i < MAX_NODES; i++)
        visited[i] = 0;

    queueArr[rear++] = startNode;
    visited[startNode] = 1;

    while (front < rear)
    {
        current = queueArr[front++];

        if (isTarget[current] == 1)      // first target found = nearest
            return current;

        for (neighbor = 0; neighbor < n; neighbor++)
        {
            if (g.getWeight(current, neighbor) != -1 && !visited[neighbor])
            {
                visited[neighbor] = 1;
                queueArr[rear++] = neighbor;
            }
        }
    }
    return -1;                           // no target reachable
}

// ---------- BLOCKAGE + REROUTE ----------
void printPathLine(int path[], int len)
{
    int i;
    if (len == 0)
    {
        cout << "No path found\n";
        return;
    }
    for (i = 0; i < len; i++)
        cout << path[i] << " ";
    cout << "\n";
}

// NOTE: the blocked edge stays removed afterwards (removeEdge is permanent).
void simulateBlockage(Graph &g, int startNode, int endNode,
                      int blockedFrom, int blockedTo)
{
    int n = g.getNumNodes();
    if (startNode < 0 || startNode >= n || endNode < 0 || endNode >= n)
    {
        cout << "simulateBlockage: invalid start or end node\n";
        return;
    }

    BFSStrategy bfs;
    int path[MAX_NODES];
    int len;

    bfs.findPath(g, startNode, endNode, path, len);
    cout << "Path before blockage: ";
    printPathLine(path, len);

    cout << "Blocking edge " << blockedFrom << " - " << blockedTo << "\n";
    g.removeEdge(blockedFrom, blockedTo);

    bfs.findPath(g, startNode, endNode, path, len);
    cout << "Path after blockage:  ";
    printPathLine(path, len);
}

#endif