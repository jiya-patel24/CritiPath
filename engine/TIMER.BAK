#ifndef TIMER_H
#define TIMER_H

#include <time.h>

class Timer
{
private:
    clock_t startTime;
    clock_t endTime;

public:
    void start()
    {
        startTime = clock();
    }

    void stop()
    {
        endTime = clock();
    }

    float getElapsedSeconds()
    {
        return (float)(endTime - startTime) / CLOCKS_PER_SEC;
    }
};

#endif