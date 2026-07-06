-- AlterTable
ALTER TABLE "Gift" ADD COLUMN "paidPlanKey" TEXT;

-- CreateTable
CREATE TABLE "GiftView" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GiftView_giftId_createdAt_idx" ON "GiftView"("giftId", "createdAt");

-- CreateIndex
CREATE INDEX "GiftView_giftId_ipHash_idx" ON "GiftView"("giftId", "ipHash");

-- AddForeignKey
ALTER TABLE "GiftView" ADD CONSTRAINT "GiftView_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
