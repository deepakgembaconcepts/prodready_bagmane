-- CreateTable
CREATE TABLE "EscalationRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "l0ResponseTime" INTEGER NOT NULL,
    "l0ResolutionTime" INTEGER NOT NULL,
    "l1ResponseTime" INTEGER,
    "l1ResolutionTime" INTEGER,
    "l2ResponseTime" INTEGER,
    "l2ResolutionTime" INTEGER,
    "l3ResponseTime" INTEGER,
    "l3ResolutionTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EscalationRule_category_subCategory_issue_priority_key" ON "EscalationRule"("category", "subCategory", "issue", "priority");
