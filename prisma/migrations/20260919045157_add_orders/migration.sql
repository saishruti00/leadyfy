-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'ONBOARDING', 'IN_PRODUCTION', 'PARTIALLY_DELIVERED', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "contractedVideoCount" INTEGER NOT NULL,
    "pricing" DECIMAL(12,2) NOT NULL,
    "gstTax" DECIMAL(12,2) NOT NULL,
    "totalInvoiceAmount" DECIMAL(12,2) NOT NULL,
    "amountReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "outstandingBalance" DECIMAL(12,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
