-- CreateTable
CREATE TABLE "Tune" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "carName" TEXT NOT NULL,
    "piClass" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "frontDist" REAL NOT NULL,
    "power" INTEGER NOT NULL,
    "drivetrain" TEXT NOT NULL,
    "trackType" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "parts" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
