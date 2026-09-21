-- AlterTable
ALTER TABLE "Script" ADD COLUMN     "writerId" TEXT;

-- AddForeignKey
ALTER TABLE "Script" ADD CONSTRAINT "Script_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
