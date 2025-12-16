-- CreateTable
CREATE TABLE "vpas" (
    "id" SERIAL NOT NULL,
    "vpa" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vpas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vpas_vpa_key" ON "vpas"("vpa");

-- AddForeignKey
ALTER TABLE "vpas" ADD CONSTRAINT "vpas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
