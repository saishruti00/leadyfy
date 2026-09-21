/*
  Warnings:

  - The values [PENDING,IN_PRODUCTION,IN_REVIEW,APPROVED,REVISION_REQUIRED] on the enum `VideoDeliverableStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoDeliverableStatus_new" AS ENUM ('SCRIPT_APPROVED', 'SHOOT_PENDING', 'RAW_FOOTAGE_RECEIVED', 'VIDEO_EDITING', 'INTERNAL_QA', 'CLIENT_REVIEW', 'REVISION', 'FINAL_APPROVED', 'DELIVERED');
ALTER TABLE "public"."VideoDeliverable" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "VideoDeliverable" ALTER COLUMN "status" TYPE "VideoDeliverableStatus_new" USING ("status"::text::"VideoDeliverableStatus_new");
ALTER TYPE "VideoDeliverableStatus" RENAME TO "VideoDeliverableStatus_old";
ALTER TYPE "VideoDeliverableStatus_new" RENAME TO "VideoDeliverableStatus";
DROP TYPE "public"."VideoDeliverableStatus_old";
ALTER TABLE "VideoDeliverable" ALTER COLUMN "status" SET DEFAULT 'SCRIPT_APPROVED';
COMMIT;

-- AlterTable
ALTER TABLE "VideoDeliverable" ALTER COLUMN "status" SET DEFAULT 'SCRIPT_APPROVED';
