/*
  Warnings:

  - You are about to drop the column `programId` on the `sessions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_programId_fkey";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "programId";
