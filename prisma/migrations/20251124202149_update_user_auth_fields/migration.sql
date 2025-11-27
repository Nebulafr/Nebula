/*
  Warnings:

  - You are about to drop the column `uid` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_uid_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "uid",
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "hashed_password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
