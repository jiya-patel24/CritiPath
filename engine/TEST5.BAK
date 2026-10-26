#include <iostream.h>
#include <conio.h>
#include "ANALYSIS.H"

void show(AnalysisStrategy &s, char name[], Graph &g, int pairs)
{
    int result[MAX_RESULT];
    int count, i;
    s.analyze(g, result, count);
    cout << name << " found " << count << ": ";
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

void main()
{
    clrscr();
    ArticulationStrategy art;
    BridgeStrategy br;
    int i;

    // A: star   0-1, 1-2, 1-3
    Graph a;
    for (i = 0; i < 4; i++) a.addNode(i, "N");
    a.addEdge(0, 1, 1, 0); a.addEdge(1, 2, 1, 0); a.addEdge(1, 3, 1, 0);
    cout << "A (star):\n";
    show(art, "  Articulation", a, 0);   // 1 found: 1
    show(br,  "  Bridge      ", a, 1);   // 3 found: (1-2) (1-3) (0-1)
    cout << "  isolationImpact(node 1, ref 0) = "
         << isolationImpact(a, 1, 0) << "  (expect 2)\n\n";

    // B: triangle + tail
    Graph b;
    for (i = 0; i < 4; i++) b.addNode(i, "N");
    b.addEdge(0, 1, 1, 0); b.addEdge(1, 2, 1, 0);
    b.addEdge(0, 2, 1, 0); b.addEdge(2, 3, 1, 0);
    cout << "B (triangle + tail):\n";
    show(art, "  Articulation", b, 0);   // 1 found: 2
    show(br,  "  Bridge      ", b, 1);   // 1 found: (2-3)

    // C: square 0-1-2-3-0
    Graph c;
    for (i = 0; i < 4; i++) c.addNode(i, "N");
    c.addEdge(0, 1, 1, 0); c.addEdge(1, 2, 1, 0);
    c.addEdge(2, 3, 1, 0); c.addEdge(3, 0, 1, 0);
    cout << "\nC (square):\n";
    show(art, "  Articulation", c, 0);   // 0 found: none
    show(br,  "  Bridge      ", c, 1);   // 0 found: none
    getch();
}