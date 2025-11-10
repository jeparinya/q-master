-- CreateTable
CREATE TABLE "ServicePoint" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "point" INTEGER,
    "servicePointId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" SERIAL NOT NULL,
    "queueNumber" INTEGER NOT NULL,
    "prefix" TEXT,
    "servicePointId" INTEGER NOT NULL,
    "counterId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" TIMESTAMP(3),
    "servedAt" TIMESTAMP(3),
    "note" TEXT,
    "hn" TEXT,
    "name" TEXT,
    "vn" TEXT,
    "vstdate" TIMESTAMP(3),
    "department" TEXT,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServicePoint_code_key" ON "ServicePoint"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Counter_code_key" ON "Counter"("code");

-- CreateIndex
CREATE INDEX "Queue_servicePointId_status_idx" ON "Queue"("servicePointId", "status");

-- AddForeignKey
ALTER TABLE "Counter" ADD CONSTRAINT "Counter_servicePointId_fkey" FOREIGN KEY ("servicePointId") REFERENCES "ServicePoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_servicePointId_fkey" FOREIGN KEY ("servicePointId") REFERENCES "ServicePoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "Counter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
