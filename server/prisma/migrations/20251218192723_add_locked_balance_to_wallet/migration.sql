-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "locked_balance" DECIMAL(10,2) NOT NULL DEFAULT 0;
