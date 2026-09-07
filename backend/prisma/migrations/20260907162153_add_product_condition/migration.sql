-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NOVO', 'SEMINOVO', 'USADO', 'PARA_REPARO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "condition" "ProductCondition" NOT NULL DEFAULT 'USADO';
