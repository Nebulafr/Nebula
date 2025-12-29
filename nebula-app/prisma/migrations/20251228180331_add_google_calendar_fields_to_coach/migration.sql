-- AlterTable
ALTER TABLE "coaches" ADD COLUMN     "google_calendar_access_token" TEXT,
ADD COLUMN     "google_calendar_connected_at" TIMESTAMP(3),
ADD COLUMN     "google_calendar_refresh_token" TEXT;
