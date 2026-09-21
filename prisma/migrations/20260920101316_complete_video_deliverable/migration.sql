/*
  Warnings:

  - Added the required column `clientId` to the `VideoDeliverable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoDeliverable" ADD COLUMN     "assignedEditorId" TEXT,
ADD COLUMN     "clientFeedbackLog" TEXT,
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "finalDeliveryLink" TEXT,
ADD COLUMN     "revisionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scriptId" TEXT,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "videoFileLink" TEXT;

-- AddForeignKey
ALTER TABLE "VideoDeliverable" ADD CONSTRAINT "VideoDeliverable_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoDeliverable" ADD CONSTRAINT "VideoDeliverable_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoDeliverable" ADD CONSTRAINT "VideoDeliverable_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoDeliverable" ADD CONSTRAINT "VideoDeliverable_assignedEditorId_fkey" FOREIGN KEY ("assignedEditorId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
