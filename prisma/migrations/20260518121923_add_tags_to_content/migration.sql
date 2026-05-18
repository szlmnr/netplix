/*
  Warnings:

  - You are about to drop the column `tag` on the `Content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Content" DROP COLUMN "tag",
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "tags" TEXT[];
