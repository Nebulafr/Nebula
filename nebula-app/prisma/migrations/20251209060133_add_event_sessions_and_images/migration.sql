/*
  Warnings:

  - You are about to drop the column `image_url` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "image_url",
ADD COLUMN     "additional_info" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "what_to_bring" TEXT;

-- CreateTable
CREATE TABLE "event_sessions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "price" DOUBLE PRECISION DEFAULT 0,
    "currency" TEXT DEFAULT 'EUR',
    "spots_left" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_sessions_event_id_idx" ON "event_sessions"("event_id");

-- CreateIndex
CREATE INDEX "event_sessions_date_idx" ON "event_sessions"("date");

-- AddForeignKey
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
