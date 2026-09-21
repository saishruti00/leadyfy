-- AlterTable
ALTER TABLE "Shoot" ADD COLUMN     "footageUploadVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rawFileIntegrityChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reshootRequired" BOOLEAN NOT NULL DEFAULT false;
