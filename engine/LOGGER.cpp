#ifndef LOGGER_H
#define LOGGER_H

#include <iostream.h>
#include <fstream.h>
#include <time.h>

// Appends "<timestamp> - <message>" as a new line in LOG.TXT.
// Returns 0 on success, -1 if the file could not be opened.
int logEvent(char message[])
{
    ofstream logFile;
    logFile.open("LOG.TXT", ios::app);

    if (!logFile)
    {
        cout << "Could not open log file\n";
        return -1;
    }

    time_t now = time(0);
    char* timeString = ctime(&now);

    // ctime() always ends with its own '\n', which would push the
    // message onto a second line. Overwrite that newline with a
    // '\0' so the timestamp and message stay on one line.
    int i = 0;
    while (timeString[i] != '\0')
    {
        if (timeString[i] == '\n')
            timeString[i] = '\0';
        i++;
    }

    logFile << timeString << " - " << message << "\n";

    logFile.close();
    return 0;
}

#endif