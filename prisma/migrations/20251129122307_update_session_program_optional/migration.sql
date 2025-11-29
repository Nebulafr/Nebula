-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_programId_fkey";

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
