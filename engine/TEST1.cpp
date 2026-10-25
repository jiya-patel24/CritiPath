#include <iostream.h>
#include <conio.h>
#include "NODE.H"
#include "EDGE.H"

void main()
{
    clrscr();

    Node a(0, "Start");
    Node b;                       // default constructor
    Edge e(0, 1, 2.5, 0);

    cout << a << "\n";
    cout << b << "\n";
    cout << "edge cost = " << e.cost << "\n";

    Node longOne(7, "123456789012345678901234567890123456789012345678901234567890");
    cout << longOne << "\n";      // must not crash

    getch();
}