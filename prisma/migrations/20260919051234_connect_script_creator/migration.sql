-- AlterTable
ALTER TABLE "Script" ADD COLUMN     "creatorId" TEXT;

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
