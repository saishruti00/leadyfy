-- CreateEnum
CREATE TYPE "ScriptFeedbackAction" AS ENUM ('APPROVED', 'REVISION_REQUIRED');

-- CreateTable
CREATE TABLE "ScriptFeedback" (
    "id" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "action" "ScriptFeedbackAction" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScriptFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScriptFeedback_scriptId_idx" ON "ScriptFeedback"("scriptId");

-- CreateIndex
CREATE INDEX "ScriptFeedback_clientId_idx" ON "ScriptFeedback"("clientId");

-- CreateIndex
CREATE INDEX "ScriptFeedback_createdAt_idx" ON "ScriptFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "ScriptFeedback" ADD CONSTRAINT "ScriptFeedback_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptFeedback" ADD CONSTRAINT "ScriptFeedback_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
