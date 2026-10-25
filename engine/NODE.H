#ifndef NODE_H
#define NODE_H

#include <iostream.h>
#include <string.h>

// A Node is just a labelled point. It knows nothing about graphs.
class Node
{
public:
    int id;
    char label[50];

    Node()
    {
        id = -1;
        label[0] = '\0';
    }

    Node(int nodeId, char nodeLabel[])
    {
        id = nodeId;
        strncpy(label, nodeLabel, 49);   // copy at most 49 characters
        label[49] = '\0';                // always end the string safely
    }
};

// Operator overloading: lets us write  cout << someNode;
// Prints like:  3: Gate
ostream& operator<<(ostream &out, const Node &n)
{
    out << n.id << ": " << n.label;
    return out;
}

#endif