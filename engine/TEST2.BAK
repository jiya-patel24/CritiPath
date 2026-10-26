#include <iostream.h>
#include <conio.h>
#include "GRAPH.H"

void main()
{
    clrscr();

    Graph g;
    g.addNode(0, "A");
    g.addNode(1, "B");
    g.addNode(2, "C");
    g.addEdge(0, 1, 5, 0);    // two-way
    g.addEdge(1, 2, 3, 1);    // one-way 1 -> 2

    g.printGraph();
    cout << g.getWeight(1, 0) << "  (expect 5, two-way works backwards)\n";
    cout << g.getWeight(1, 2) << "  (expect 3)\n";
    cout << g.getWeight(2, 1) << "  (expect -1, one-way edge)\n\n";

    Graph big;
    int i;
    int result = 0;
    for (i = 0; i < 20; i++)
        result = big.addNode(i, "N");
    cout << result << "  (expect 0, 20th node accepted)\n";
    cout << big.addNode(20, "X") << "  (expect -1, 21st rejected)\n";
    cout << big.getNumNodes() << "  (expect 20)\n";

    getch();
}