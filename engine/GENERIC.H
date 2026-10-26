#ifndef GENERIC_H
#define GENERIC_H

// One function, many types: T is replaced by int, float, ... at compile time.
template <class T>
void bubbleSort(T arr[], int size)
{
    int i, j;
    T temp;
    for (i = 0; i < size - 1; i++)
    {
        for (j = 0; j < size - 1 - i; j++)
        {
            if (arr[j] > arr[j + 1])
            {
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

#endif