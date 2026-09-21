-- CreateEnum
CREATE TYPE "VideoDeliverableStatus" AS ENUM ('PENDING', 'IN_PRODUCTION', 'IN_REVIEW', 'APPROVED', 'DELIVERED', 'REVISION_REQUIRED');

-- CreateTable
CREATE TABLE "VideoDeliverable" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shootId" TEXT,
    "videoNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "VideoDeliverableStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoDeliverable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoDeliverable" ADD CONSTRAINT "VideoDeliverable_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoDeliverable" ADD CONSTRAINT "VideoDeliverable_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "Shoot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
