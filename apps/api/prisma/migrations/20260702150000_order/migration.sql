-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'failed', 'canceled', 'refunded');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "planKey" "PlanKey" NOT NULL,
    "amountCharged" INTEGER NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'asaas',
    "gatewayId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "billingType" TEXT,
    "customerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_giftId_idx" ON "Order"("giftId");

-- CreateIndex
CREATE INDEX "Order_gatewayId_idx" ON "Order"("gatewayId");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
