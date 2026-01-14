-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "target_audience" TEXT;

-- CreateTable
CREATE TABLE "program_coaches" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_coaches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_coaches_program_id_idx" ON "program_coaches"("program_id");

-- CreateIndex
CREATE INDEX "program_coaches_coach_id_idx" ON "program_coaches"("coach_id");

-- CreateIndex
CREATE UNIQUE INDEX "program_coaches_program_id_coach_id_key" ON "program_coaches"("program_id", "coach_id");

-- AddForeignKey
ALTER TABLE "program_coaches" ADD CONSTRAINT "program_coaches_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_coaches" ADD CONSTRAINT "program_coaches_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
