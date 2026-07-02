-- CreateEnum
CREATE TYPE "GiftStatus" AS ENUM ('draft', 'paid', 'archived');

-- CreateEnum
CREATE TYPE "GiftAssetType" AS ENUM ('image', 'audio');

-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "status" "GiftStatus" NOT NULL DEFAULT 'draft',
    "ownerAccountId" TEXT,
    "editToken" TEXT NOT NULL,
    "occasion" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "watermark" BOOLEAN NOT NULL DEFAULT true,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftAsset" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "type" "GiftAssetType" NOT NULL,
    "r2Key" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gift_slug_key" ON "Gift"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Gift_editToken_key" ON "Gift"("editToken");

-- CreateIndex
CREATE INDEX "Gift_status_createdAt_idx" ON "Gift"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Gift_ownerAccountId_idx" ON "Gift"("ownerAccountId");

-- CreateIndex
CREATE INDEX "GiftAsset_giftId_order_idx" ON "GiftAsset"("giftId", "order");

-- AddForeignKey
ALTER TABLE "GiftAsset" ADD CONSTRAINT "GiftAsset_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
