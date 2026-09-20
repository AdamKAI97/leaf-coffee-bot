-- CreateEnum
CREATE TYPE "TableCallStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED');

-- CreateTable
CREATE TABLE "TableCall" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "status" "TableCallStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TableCall_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TableCall" ADD CONSTRAINT "TableCall_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableCall" ADD CONSTRAINT "TableCall_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

