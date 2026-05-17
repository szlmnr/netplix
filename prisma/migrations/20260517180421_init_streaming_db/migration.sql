-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MOVIE', 'SERIES');

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "tmdbId" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieData" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,

    CONSTRAINT "MovieData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 1,
    "episodeNum" INTEGER NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewStats" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViewStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Content_tmdbId_idx" ON "Content"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieData_contentId_key" ON "MovieData"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_contentId_season_episodeNum_key" ON "Episode"("contentId", "season", "episodeNum");

-- CreateIndex
CREATE INDEX "ViewStats_contentId_viewedAt_idx" ON "ViewStats"("contentId", "viewedAt");

-- CreateIndex
CREATE INDEX "Comment_contentId_idx" ON "Comment"("contentId");

-- AddForeignKey
ALTER TABLE "MovieData" ADD CONSTRAINT "MovieData_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewStats" ADD CONSTRAINT "ViewStats_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
