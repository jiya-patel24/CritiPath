#include <iostream.h>
#include <conio.h>
#include "PATHFIND.H"

void main()
{
    clrscr();
    Graph g;
    int i, path[MAX_NODES], len;
    for (i = 0; i < 4; i++) g.addNode(i, "N");
    g.addEdge(0, 3, 10, 0);
    g.addEdge(0, 1, 2.5, 0);
    g.addEdge(1, 2, 1.25, 0);
    g.addEdge(2, 3, 1, 0);

    BFSStrategy bfs;
    DijkstraStrategy dij;
    PathfindingStrategy *s;      // base pointer = polymorphism

    s = &bfs;
    cout << s->findPath(g, 0, 3, path, len) << "  path: ";
    printPathLine(path, len);    // expect 1, path 0 3

    s = &dij;
    cout << s->findPath(g, 0, 3, path, len) << "  path: ";
    printPathLine(path, len);    // expect 4.75, path 0 1 2 3

    cout << s->findPath(g, 0, 9, path, len) << "  (expect -1, bad node)\n";
    getch();
}