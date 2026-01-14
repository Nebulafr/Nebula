-- CreateTable
CREATE TABLE "program_schedules" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_schedules_program_id_idx" ON "program_schedules"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "program_schedules_program_id_start_date_key" ON "program_schedules"("program_id", "start_date");

-- AddForeignKey
ALTER TABLE "program_schedules" ADD CONSTRAINT "program_schedules_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
