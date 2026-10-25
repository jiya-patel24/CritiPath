#ifndef EDGE_H
#define EDGE_H

// An Edge is a connection between two node ids, with a cost.
class Edge
{
public:
    int fromId;
    int toId;
    float cost;
    int directed;   // 0 = two-way, 1 = one-way

    Edge()
    {
        fromId = -1;
        toId = -1;
        cost = 0;
        directed = 0;
    }

    Edge(int from, int to, float edgeCost, int isDirected)
    {
        fromId = from;
        toId = to;
        cost = edgeCost;
        directed = isDirected;
    }
};

#endif