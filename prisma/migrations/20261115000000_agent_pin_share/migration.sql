-- AlterTable
ALTER TABLE "agent" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "shareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "agent_shareId_key" ON "agent"("shareId");
