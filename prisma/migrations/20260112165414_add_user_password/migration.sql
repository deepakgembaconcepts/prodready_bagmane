-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "password" TEXT NOT NULL DEFAULT '$2b$10$EpRnTzVlqHNP0.fKbX99ijznOJVEST5/0bgjBogMHR.zSHCNghC',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "phone" TEXT,
    "icon" TEXT,
    "permissions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "createdAt", "description", "email", "icon", "id", "name", "permissions", "phone", "role", "status", "updatedAt") SELECT "avatar", "createdAt", "description", "email", "icon", "id", "name", "permissions", "phone", "role", "status", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
