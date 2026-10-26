#ifndef FILEIO_H
#define FILEIO_H

#include <fstream.h>
#include <string.h>
#include "GRAPH.H"

// File format:  NODE <id> <label>     EDGE <from> <to> <cost> <directed>
// Limitation: labels must not contain spaces or be empty.
// Returns 0 on success, -1 on failure.
int saveGraphToFile(Graph &g, char filename[])
{
    ofstream f(filename);
    if (!f)
        return -1;

    int i;
    for (i = 0; i < g.getNodeCount(); i++)
    {
        Node nd = g.getNodeAt(i);
        f << "NODE " << nd.id << " " << nd.label << "\n";
    }
    for (i = 0; i < g.getEdgeCount(); i++)
    {
        Edge e = g.getEdgeAt(i);
        f << "EDGE " << e.fromId << " " << e.toId << " "
          << e.cost << " " << e.directed << "\n";
    }

    if (!f)
        return -1;
    return 0;
}

// Loads INTO g, so pass a new empty Graph (existing content is kept).
// If it returns -1 the graph may be half-filled: throw it away.
// Returns -1 if: file missing, bad line, more than MAX_NODES nodes,
// node ids not 0,1,2.. in order, or an edge uses a node that does not exist.
int loadGraphFromFile(Graph &g, char filename[])
{
    ifstream f(filename);
    if (!f)
        return -1;

    char tag[10];
    char label[50];
    int id, from, to, directed;
    float cost;

    f.width(10);                         // never read more than 9 chars
    while (f >> tag)
    {
        if (strcmp(tag, "NODE") == 0)
        {
            f >> id;
            f.width(50);
            f >> label;
            if (!f) return -1;
            if (id != g.getNodeCount()) return -1;    // ids must be in order
            if (g.addNode(id, label) == -1) return -1; // too many nodes
        }
        else if (strcmp(tag, "EDGE") == 0)
        {
            f >> from >> to >> cost >> directed;
            if (!f) return -1;
            if (from < 0 || from >= g.getNodeCount() ||
                to < 0 || to >= g.getNodeCount())
                return -1;                            // node does not exist
            g.addEdge(from, to, cost, directed);
        }
        else
            return -1;                   // unknown line = bad file

        f.width(10);                     // width resets after each >>
    }
    return 0;
}

#endif