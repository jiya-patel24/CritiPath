#include <iostream.h>
#include <fstream.h>
#include <string.h>
#include <stdlib.h>
#include "GRAPH.H"
#include "PATHFIND.H"
#include "ANALYSIS.H"
#include "FILEIO.H"
#include "LOGGER.H"

// Writes an error RESULT.TXT. Returns 1 so main can do:  return reportError(...)
int reportError(char command[], char message[])
{
    ofstream out("RESULT.TXT");
    out << "STATUS ERROR\n";
    out << "COMMAND " << command << "\n";
    out << "MESSAGE " << message << "\n";
    cout << "ERROR: " << message << "\n";
    return 1;
}

// Writes  KEY v1 v2 v3   or   KEY NONE  when the list is empty.
void writeList(ostream &out, char key[], int values[], int count)
{
    int i;
    out << key;
    if (count == 0)
        out << " NONE";
    for (i = 0; i < count; i++)
        out << " " << values[i];
    out << "\n";
}

int validId(Graph &g, int id)
{
    return (id >= 0 && id < g.getNumNodes());
}

int main(int argc, char *argv[])
{
    if (argc < 2)
        return reportError("NONE",
            "no command (ROUTE STEPS NEAREST BLOCK ISOLATE CRITICAL)");

    char *command = argv[1];

    Graph g;
    if (loadGraphFromFile(g, "GRAPH.TXT") != 0)
        return reportError(command, "could not load GRAPH.TXT (missing or invalid)");

    logEvent(command);

    // ---------- ROUTE (Dijkstra) / STEPS (BFS) ----------
    if (strcmpi(command, "ROUTE") == 0 || strcmpi(command, "STEPS") == 0)
    {
        if (argc != 4)
            return reportError(command, "usage: ROUTE <from> <to>");

        int from = atoi(argv[2]);
        int to = atoi(argv[3]);
        if (!validId(g, from) || !validId(g, to))
            return reportError(command, "node id out of range");

        BFSStrategy bfs;
        DijkstraStrategy dij;
        PathfindingStrategy *strategy;      // one pointer, two algorithms

        if (strcmpi(command, "STEPS") == 0)
            strategy = &bfs;
        else
            strategy = &dij;

        int path[MAX_NODES];
        int len;
        float result = strategy->findPath(g, from, to, path, len);

        ofstream out("RESULT.TXT");
        out << "STATUS OK\n";
        out << "COMMAND " << command << "\n";
        writeList(out, "PATH", path, len);
        if (len > 0)
        {
            if (strcmpi(command, "STEPS") == 0)
                out << "STEPS " << result << "\n";
            else
                out << "COST " << result << "\n";
        }
        cout << "Done. See RESULT.TXT\n";
        return 0;
    }

    // ---------- NEAREST ----------
    if (strcmpi(command, "NEAREST") == 0)
    {
        if (argc < 4)
            return reportError(command, "usage: NEAREST <start> <target> [target...]");

        int start = atoi(argv[2]);
        if (!validId(g, start))
            return reportError(command, "node id out of range");

        int isTarget[MAX_NODES];
        int i, t;
        for (i = 0; i < MAX_NODES; i++)
            isTarget[i] = 0;

        for (i = 3; i < argc; i++)
        {
            t = atoi(argv[i]);
            if (!validId(g, t))
                return reportError(command, "target id out of range");
            isTarget[t] = 1;
        }

        int nearest = findNearestTarget(g, start, isTarget);

        ofstream out("RESULT.TXT");
        out << "STATUS OK\n";
        out << "COMMAND " << command << "\n";
        if (nearest == -1)
            out << "NEAREST NONE\n";
        else
            out << "NEAREST " << nearest << "\n";
        cout << "Done. See RESULT.TXT\n";
        return 0;
    }

    // ---------- BLOCK ----------
    if (strcmpi(command, "BLOCK") == 0)
    {
        if (argc != 6)
            return reportError(command, "usage: BLOCK <from> <to> <blockedA> <blockedB>");

        int from = atoi(argv[2]);
        int to = atoi(argv[3]);
        int blockA = atoi(argv[4]);
        int blockB = atoi(argv[5]);

        if (!validId(g, from) || !validId(g, to) ||
            !validId(g, blockA) || !validId(g, blockB))
            return reportError(command, "node id out of range");
        if (g.getWeight(blockA, blockB) == -1)
            return reportError(command, "edge to block does not exist");

        BFSStrategy bfs;
        int before[MAX_NODES];
        int after[MAX_NODES];
        int beforeLen, afterLen;

        bfs.findPath(g, from, to, before, beforeLen);
        g.removeEdge(blockA, blockB);
        bfs.findPath(g, from, to, after, afterLen);

        ofstream out("RESULT.TXT");
        out << "STATUS OK\n";
        out << "COMMAND " << command << "\n";
        writeList(out, "BEFORE", before, beforeLen);
        writeList(out, "AFTER", after, afterLen);
        cout << "Done. See RESULT.TXT\n";
        return 0;
    }

    // ---------- ISOLATE ----------
    if (strcmpi(command, "ISOLATE") == 0)
    {
        if (argc != 4)
            return reportError(command, "usage: ISOLATE <node> <reference>");

        int node = atoi(argv[2]);
        int reference = atoi(argv[3]);
        int impact = isolationImpact(g, node, reference);

        if (impact == -1)
            return reportError(command, "invalid ids (in range and different)");

        ofstream out("RESULT.TXT");
        out << "STATUS OK\n";
        out << "COMMAND " << command << "\n";
        out << "IMPACT " << impact << "\n";
        cout << "Done. See RESULT.TXT\n";
        return 0;
    }

    // ---------- CRITICAL (analysis strategies) ----------
    if (strcmpi(command, "CRITICAL") == 0)
    {
        ArticulationStrategy art;
        BridgeStrategy br;
        AnalysisStrategy *analysis;         // one pointer, two analyses
        int result[MAX_RESULT];
        int count, i;

        analysis = &art;
        if (analysis->analyze(g, result, count) == -1)
            return reportError(command, "graph is empty or too big");

        ofstream out("RESULT.TXT");
        out << "STATUS OK\n";
        out << "COMMAND " << command << "\n";
        writeList(out, "CRITICAL_NODES", result, count);

        analysis = &br;
        analysis->analyze(g, result, count);
        out << "BRIDGES";
        if (count == 0)
            out << " NONE";
        for (i = 0; i < count; i++)
            out << " " << result[2 * i] << "-" << result[2 * i + 1];
        out << "\n";

        cout << "Done. See RESULT.TXT\n";
        return 0;
    }

    return reportError(command, "unknown command");
}