#ifndef GRAPH_H
#define GRAPH_H

#include <iostream.h>
#include "NODE.H"
#include "EDGE.H"

// Largest number of nodes the engine supports. The pathfinding code uses
// arrays of this size, so a graph bigger than this would overflow them.
const int MAX_NODES = 20;

// IMPORTANT RULE: node ids must be 0, 1, 2, ... with NO gaps.
// The algorithms use the id as a position in an array.
class Graph
{
private:
    Node* nodes;
    int nodeCount;
    int nodeCapacity;

    Edge* edges;
    int edgeCount;
    int edgeCapacity;

    // Copying is blocked (see note above). Declared, never defined.
    Graph(const Graph &other);
    void operator=(const Graph &other);

    void growNodeArray()
    {
        int newCapacity = nodeCapacity * 2;
        Node* newArray = new Node[newCapacity];
        int i;
        for (i = 0; i < nodeCount; i++)
            newArray[i] = nodes[i];
        delete[] nodes;
        nodes = newArray;
        nodeCapacity = newCapacity;
    }

    void growEdgeArray()
    {
        int newCapacity = edgeCapacity * 2;
        Edge* newArray = new Edge[newCapacity];
        int i;
        for (i = 0; i < edgeCount; i++)
            newArray[i] = edges[i];
        delete[] edges;
        edges = newArray;
        edgeCapacity = newCapacity;
    }

    void removeEdgesForNode(int id)
    {
        int i = 0;
        int j;

        while (i < edgeCount)
        {
            if (edges[i].fromId == id || edges[i].toId == id)
            {
                for (j = i; j < edgeCount - 1; j++)
                    edges[j] = edges[j + 1];
                edgeCount--;
            }
            else
            {
                i++;
            }
        }
    }

public:
    Graph()
    {
        nodeCapacity = 4;
        nodes = new Node[nodeCapacity];
        nodeCount = 0;

        edgeCapacity = 4;
        edges = new Edge[edgeCapacity];
        edgeCount = 0;
    }

    ~Graph()
    {
        delete[] nodes;
        delete[] edges;
    }

    // Returns 0 on success, -1 if the graph already has MAX_NODES nodes.
    int addNode(int id, char label[])
    {
        if (nodeCount >= MAX_NODES)
            return -1;
        if (nodeCount == nodeCapacity)
            growNodeArray();
        nodes[nodeCount] = Node(id, label);
        nodeCount++;
        return 0;
    }

    void addEdge(int fromId, int toId, float cost, int directed)
    {
        if (edgeCount == edgeCapacity)
            growEdgeArray();
        edges[edgeCount] = Edge(fromId, toId, cost, directed);
        edgeCount++;
    }

    // WARNING: removing a node leaves a gap in the ids, which breaks the
    // "0, 1, 2, ... no gaps" rule. Do not use it before running pathfinding.
    void removeNode(int id)
    {
        int i;
        int index = -1;

        for (i = 0; i < nodeCount; i++)
        {
            if (nodes[i].id == id)
            {
                index = i;
                break;
            }
        }

        if (index == -1)
        {
            cout << "removeNode: node " << id << " not found\n";
            return;
        }

        for (i = index; i < nodeCount - 1; i++)
            nodes[i] = nodes[i + 1];

        nodeCount--;

        removeEdgesForNode(id);
    }

    void removeEdge(int fromId, int toId)
    {
        int i;
        int j;
        int matches;

        for (i = 0; i < edgeCount; i++)
        {
            matches = 0;

            if (edges[i].directed == 1)
            {
                if (edges[i].fromId == fromId && edges[i].toId == toId)
                    matches = 1;
            }
            else
            {
                if ((edges[i].fromId == fromId && edges[i].toId == toId) ||
                    (edges[i].fromId == toId && edges[i].toId == fromId))
                    matches = 1;
            }

            if (matches == 1)
            {
                for (j = i; j < edgeCount - 1; j++)
                    edges[j] = edges[j + 1];
                edgeCount--;
                return;
            }
        }

        cout << "removeEdge: edge " << fromId << " -> " << toId << " not found\n";
    }

    void printGraph()
    {
        int i;

        cout << "----- NODES -----\n";
        for (i = 0; i < nodeCount; i++)
            cout << nodes[i] << "\n";          // uses operator<< from NODE.H

        cout << "----- EDGES -----\n";
        for (i = 0; i < edgeCount; i++)
        {
            cout << edges[i].fromId << " -> " << edges[i].toId
                 << " (cost=" << edges[i].cost
                 << ", directed=" << edges[i].directed << ")\n";
        }
    }

    // ---- METHODS NEEDED FOR PATHFINDING ----

    int getNumNodes()
    {
        return nodeCount;
    }

    float getWeight(int fromId, int toId)
    {
        int i;
        for (i = 0; i < edgeCount; i++)
        {
            if (edges[i].directed == 1)
            {
                if (edges[i].fromId == fromId && edges[i].toId == toId)
                    return edges[i].cost;
            }
            else
            {
                if ((edges[i].fromId == fromId && edges[i].toId == toId) ||
                    (edges[i].fromId == toId && edges[i].toId == fromId))
                    return edges[i].cost;
            }
        }
        return -1;   // no edge found
    }

    // ---- READ-ONLY GETTERS (for save/load) ----
    int getNodeCount()          { return nodeCount; }
    int getEdgeCount()          { return edgeCount; }
    Node getNodeAt(int index)   { return nodes[index]; }
    Edge getEdgeAt(int index)   { return edges[index]; }
};

#endif