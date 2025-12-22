-- AlterTable
CREATE SEQUENCE transactions_id_seq;
ALTER TABLE "transactions" ALTER COLUMN "id" SET DEFAULT nextval('transactions_id_seq');
ALTER SEQUENCE transactions_id_seq OWNED BY "transactions"."id";
