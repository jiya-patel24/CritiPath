#include <iostream.h>
#include <fstream.h>
#include <conio.h>
#include "FILEIO.H"

void main()
{
    clrscr();
    Graph d;
    d.addNode(0, "A"); d.addNode(1, "B"); d.addNode(2, "C");
    d.addEdge(0, 1, 5, 0);
    d.addEdge(1, 2, 3, 0);
    cout << "save: " << saveGraphToFile(d, "T4.TXT") << "  (expect 0)\n";

    Graph e;
    int r = loadGraphFromFile(e, "T4.TXT");     // run the load FIRST, on its own line
    cout << "load: " << r << "  nodes=" << e.getNodeCount()
         << " edges=" << e.getEdgeCount() << "  (expect 0, 3, 2)\n";

    Graph x;
    cout << "missing: " << loadGraphFromFile(x, "NOFILE.TXT") << "  (expect -1)\n";

    ofstream bad("BAD1.TXT");           // edge uses node 5, which does not exist
    bad << "NODE 0 A\nEDGE 0 5 1 0\n";
    bad.close();
    Graph y;
    cout << "bad edge: " << loadGraphFromFile(y, "BAD1.TXT") << "  (expect -1)\n";

    ofstream big("BAD2.TXT");           // 21 nodes
    int i;
    for (i = 0; i < 21; i++)
        big << "NODE " << i << " N\n";
    big.close();
    Graph z;
    cout << "21 nodes: " << loadGraphFromFile(z, "BAD2.TXT") << "  (expect -1)\n";
    getch();
}