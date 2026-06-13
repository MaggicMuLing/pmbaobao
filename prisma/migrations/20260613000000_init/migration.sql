-- CreateTable
CREATE TABLE IF NOT EXISTS "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" TEXT NOT NULL,
    "parentSourceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconClass" TEXT,
    "kind" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" TEXT NOT NULL,
    "sourceDetailUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "outboundUrl" TEXT,
    "iconUrl" TEXT,
    "isNoContentCard" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SiteCategory" (
    "siteId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("siteId", "categoryId"),
    CONSTRAINT "SiteCategory_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SiteCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SyncRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "categoryCount" INTEGER NOT NULL DEFAULT 0,
    "siteCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Category_sourceId_key" ON "Category"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Site_sourceId_key" ON "Site"("sourceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SiteCategory_categoryId_sortOrder_idx" ON "SiteCategory"("categoryId", "sortOrder");
