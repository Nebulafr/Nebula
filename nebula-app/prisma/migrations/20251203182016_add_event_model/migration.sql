/*
  Warnings:

  - Added the required column `updated_at` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "attendees" INTEGER DEFAULT 0,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "max_attendees" INTEGER,
ADD COLUMN     "organizer" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
