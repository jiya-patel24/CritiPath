#include <iostream.h>
#include <conio.h>
#include <fstream.h>
#include <stdio.h>
#include "GRAPH.H"
#include "PATHFIND.H"
#include "ANALYSIS.H"
#include "FILEIO.H"
#include "LOGGER.H"
#include "TIMER.H"

// =====================================================================
// Presentation only. The engine headers never print diagrams or use
// any application words.
// =====================================================================

void banner(char title[])
{
    cout << "============================================================\n";
    cout << "  " << title << "\n";
    cout << "============================================================\n\n";
}

void nextScreen()
{
    cout << "\n   [ press any key to continue ]";
    getch();
    clrscr();
}

// Prints a text file line by line, indented, so we can SHOW what was saved.
void showFile(char filename[])
{
    ifstream f(filename);
    char line[100];

    if (!f)
    {
        cout << "   (could not open " << filename << ")\n";
        return;
    }
    while (f.getline(line, 100))
        cout << "   | " << line << "\n";
}

// Takes the ABSTRACT base class by reference: works for any algorithm.
void showPath(PathfindingStrategy &s, char name[], Graph &g, int from, int to)
{
    int path[MAX_NODES];
    int len;
    float result = s.findPath(g, from, to, path, len);

    cout << "   " << name << " -> result = " << result << "   path: ";
    printPathLine(path, len);
}

// Same idea for analysis: any AnalysisStrategy works here.
// pairs = 1 -> results are (from-to) pairs, 0 -> single node ids
void showAnalysis(AnalysisStrategy &s, char name[], Graph &g, int pairs)
{
    int result[MAX_RESULT];
    int count, i;

    s.analyze(g, result, count);
    cout << "   " << name << " found " << count << ": ";
    if (count == 0)
        cout << "none";
    for (i = 0; i < count; i++)
    {
        if (pairs == 1)
            cout << "(" << result[2 * i] << "-" << result[2 * i + 1] << ") ";
        else
            cout << result[i] << " ";
    }
    cout << "\n";
}

// ---------- SCREEN 0: STATUS ----------
void demoStatus()
{
    banner("CRITIPATH - GRAPH ENGINE : STATUS REPORT");
    cout << "   A general-purpose graph engine. No application words inside.\n\n";
    cout << "   [DONE]  Node, Edge, Graph (classes, dynamic memory)\n";
    cout << "   [DONE]  PathfindingStrategy + BFS + Dijkstra (polymorphism)\n";
    cout << "   [DONE]  Nearest target search\n";
    cout << "   [DONE]  Blockage simulation + reroute\n";
    cout << "   [DONE]  Isolation impact report\n";
    cout << "   [DONE]  AnalysisStrategy: critical nodes + bridges\n";
    cout << "   [DONE]  Save / load graph to file\n";
    cout << "   [DONE]  Event logger (LOG.TXT)\n";
    cout << "   [DONE]  Timer\n";
    cout << "   [DONE]  ENGINE.EXE: command line in, RESULT.TXT out\n";
    nextScreen();
}

// ---------- SCREEN 1: BFS vs DIJKSTRA (polymorphism) ----------
void demoRoutes()
{
    int i;
    Graph g;
    for (i = 0; i < 4; i++) g.addNode(i, "N");
    g.addEdge(0, 3, 10, 0);
    g.addEdge(0, 1, 1, 0);
    g.addEdge(1, 2, 1, 0);
    g.addEdge(2, 3, 1, 0);

    BFSStrategy bfs;
    DijkstraStrategy dij;

    banner("PART A: ROUTE FINDING - one interface, two algorithms");
    cout << "   Same graph, same call. Only the algorithm object changes.\n\n";

    cout << "  [0]------10------[3]\n";
    cout << "   |                |\n";
    cout << "   1                1\n";
    cout << "   |                |\n";
    cout << "  [1]------1-------[2]\n";
    cout << "  (numbers on lines = edge cost)\n\n";

    cout << "   Route from node 0 to node 3:\n";
    showPath(bfs, "BFS     ", g, 0, 3);
    showPath(dij, "Dijkstra", g, 0, 3);

    cout << "\n   BFS result = steps (fewest edges).\n";
    cout << "   Dijkstra result = total cost (cheapest route).\n";
    cout << "   OOP: abstract base + virtual findPath() = polymorphism.\n";
    nextScreen();
}

// ---------- SCREEN 2: NEAREST TARGET ----------
void demoNearest()
{
    int i;
    Graph g;
    for (i = 0; i < 5; i++) g.addNode(i, "N");
    for (i = 0; i < 4; i++) g.addEdge(i, i + 1, 1, 0);

    int isTarget[MAX_NODES];
    int noTarget[MAX_NODES];
    for (i = 0; i < MAX_NODES; i++)
    {
        isTarget[i] = 0;
        noTarget[i] = 0;
    }
    isTarget[3] = 1;

    banner("PART B: NEAREST TARGET");
    cout << "   Which marked node (*) is closest, counting steps?\n\n";
    cout << "  [0]--[1]--[2]--[3*]--[4]\n\n";

    cout << "   Start at node 0 -> nearest target = "
         << findNearestTarget(g, 0, isTarget) << "   (expect 3)\n";
    cout << "   Start at node 4 -> nearest target = "
         << findNearestTarget(g, 4, isTarget) << "   (expect 3)\n";
    cout << "   No target marked -> result        = "
         << findNearestTarget(g, 0, noTarget) << "  (expect -1)\n\n";

    cout << "   -1 is our error code for \"nothing found\".\n";
    cout << "   (Turbo C++ has no try/catch, so we return codes instead.)\n";
    nextScreen();
}

// ---------- SCREEN 3: BLOCKAGE ----------
void demoBlockage()
{
    int i;
    Graph g;
    for (i = 0; i < 4; i++) g.addNode(i, "N");
    g.addEdge(0, 1, 1, 0);
    g.addEdge(1, 2, 1, 0);
    g.addEdge(0, 2, 1, 0);
    g.addEdge(2, 3, 1, 0);

    banner("PART C: BLOCKAGE + AUTOMATIC REROUTE");
    cout << "   BEFORE (all edges open):\n\n";
    cout << "   +---------------+\n";
    cout << "   |               |\n";
    cout << "  [0]-----[1]-----[2]-----[3]\n\n";

    cout << "   Engine output:\n";
    cout << "   ----------------------------------\n";
    simulateBlockage(g, 0, 3, 0, 2);
    cout << "   ----------------------------------\n\n";

    cout << "   AFTER (edge 0-2 closed):\n\n";
    cout << "   X  edge 0-2 closed  X\n";
    cout << "  [0]-----[1]-----[2]-----[3]\n";
    nextScreen();
}

// ---------- SCREEN 4: ISOLATION IMPACT ----------
void demoIsolation()
{
    int i;
    Graph g;
    for (i = 0; i < 4; i++) g.addNode(i, "N");
    g.addEdge(0, 1, 1, 0);
    g.addEdge(1, 2, 1, 0);
    g.addEdge(1, 3, 1, 0);

    banner("PART D: ISOLATION IMPACT");
    cout << "   If one node fails, how many others lose connection to node 0?\n\n";
    cout << "  [0]-----[1]-----[2]\n";
    cout << "           |\n";
    cout << "          [3]\n\n";

    cout << "   Node 1 fails -> nodes cut off = "
         << isolationImpact(g, 1, 0) << "   (expect 2: nodes 2 and 3)\n";
    cout << "   Node 2 fails -> nodes cut off = "
         << isolationImpact(g, 2, 0) << "   (expect 0: nothing else depends on it)\n\n";

    cout << "   Node 1 is a critical junction: the network splits without it.\n";
    cout << "   The next screen finds such nodes automatically.\n";
    nextScreen();
}

// ---------- SCREEN 5: CRITICAL NODES + BRIDGES ----------
void demoCritical()
{
    int i;
    Graph g;
    for (i = 0; i < 4; i++) g.addNode(i, "N");
    g.addEdge(0, 1, 1, 0);
    g.addEdge(1, 2, 1, 0);
    g.addEdge(0, 2, 1, 0);
    g.addEdge(2, 3, 1, 0);

    ArticulationStrategy art;
    BridgeStrategy br;

    banner("PART E: CRITICAL NODES + BRIDGES (AnalysisStrategy)");
    cout << "   Which node or link, if lost, splits the network?\n\n";
    cout << "  [0]-----[1]\n";
    cout << "    \\     /\n";
    cout << "     \\   /\n";
    cout << "      [2]-----[3]\n\n";

    showAnalysis(art, "Critical nodes", g, 0);
    showAnalysis(br,  "Bridges       ", g, 1);

    cout << "\n   The triangle 0-1-2 holds together (two ways round).\n";
    cout << "   Node 3 hangs on ONE link, so link 2-3 is a bridge and\n";
    cout << "   node 2 is critical.\n";
    cout << "   OOP: new abstract base AnalysisStrategy next to\n";
    cout << "   PathfindingStrategy. Adding it changed NO existing class\n";
    cout << "   (Open-Closed principle).\n";
    nextScreen();
}

// ---------- SCREEN 6: SAVE / LOAD ----------
void demoSaveLoad()
{
    Graph d;
    d.addNode(0, "A");
    d.addNode(1, "B");
    d.addNode(2, "C");
    d.addEdge(0, 1, 5, 0);
    d.addEdge(1, 2, 3, 0);

    banner("PART F: SAVE / LOAD (file handling)");
    cout << "  [0:A]---5---[1:B]---3---[2:C]\n\n";

    cout << "   Save to DEMOGRPH.TXT -> result = "
         << saveGraphToFile(d, "DEMOGRPH.TXT") << "   (0 = success)\n";
    cout << "   File contents:\n";
    showFile("DEMOGRPH.TXT");

    Graph e;
    cout << "\n   Load into a NEW graph -> result = "
         << loadGraphFromFile(e, "DEMOGRPH.TXT") << "   (0 = success)\n";
    cout << "   Original: " << d.getNodeCount() << " nodes, "
         << d.getEdgeCount() << " edges\n";
    cout << "   Loaded:   " << e.getNodeCount() << " nodes, "
         << e.getEdgeCount() << " edges\n";

    Graph x;
    cout << "   Load a missing file    -> result = "
         << loadGraphFromFile(x, "NOFILE.TXT") << "  (-1 = error)\n";
    nextScreen();
}

// ---------- SCREEN 7: LOGGER ----------
void demoLogger()
{
    banner("PART G: EVENT LOGGER (file handling)");
    cout << "   Each event is added as a new line in LOG.TXT.\n";
    cout << "   (Demo clears the old log first so the output is clean.)\n\n";

    remove("LOG.TXT");

    cout << "   logEvent -> " << logEvent("Edge 0-2 blocked")
         << "   (0 = success)\n";
    cout << "   logEvent -> " << logEvent("Rerouted through node 1")
         << "   (0 = success)\n\n";

    cout << "   LOG.TXT now contains:\n";
    showFile("LOG.TXT");

    cout << "\n   Opened in append mode (ios::app): old lines are never erased.\n";
    nextScreen();
}

// ---------- SCREEN 8: TIMER + SUMMARY ----------
void demoSummary()
{
    Timer t;
    long loopCounter;

    t.start();
    for (loopCounter = 0; loopCounter < 5000000L; loopCounter++)
    {
        // burn some time
    }
    t.stop();

    banner("SUMMARY: WHAT EACH PART PROVES");
    cout << "   Timer test loop took " << t.getElapsedSeconds() << " seconds\n\n";
    cout << "   Node, Edge, Graph   Unit 2-3: classes, constructors,\n";
    cout << "                       destructor, new / delete[]\n";
    cout << "   operator<< (Node)   Operator overloading\n";
    cout << "   PathfindingStrategy Unit 4: abstract class, virtual function\n";
    cout << "   BFS, Dijkstra       Unit 4: inheritance, overriding,\n";
    cout << "                       run-time polymorphism\n";
    cout << "   AnalysisStrategy    Unit 6 SOLID: Open-Closed, Liskov,\n";
    cout << "                       Interface Segregation\n";
    cout << "   Save/load, logger   Unit 5: ofstream, ifstream, ios::app\n";
    cout << "   Return codes (-1)   Unit 6 idea: error handling without\n";
    cout << "                       try/catch (not available in Turbo C++)\n";
}

// ================== MAIN ==================
int main()
{
    clrscr();

    demoStatus();
    demoRoutes();
    demoNearest();
    demoBlockage();
    demoIsolation();
    demoCritical();
    demoSaveLoad();
    demoLogger();
    demoSummary();

    getch();
    return 0;
}