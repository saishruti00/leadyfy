-- CreateEnum
CREATE TYPE "ScriptStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'IN_REVIEW', 'SENT_TO_CLIENT', 'REVISION_REQUIRED', 'APPROVED', 'READY_FOR_SHOOT');

-- CreateTable
CREATE TABLE "Script" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "videoNumber" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "scriptText" TEXT NOT NULL,
    "referenceLinks" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "comments" TEXT,
    "status" "ScriptStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
