-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "materials" TEXT[] DEFAULT ARRAY[]::TEXT[];
