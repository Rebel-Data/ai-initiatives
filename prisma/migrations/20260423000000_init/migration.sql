-- Initial schema: AI initiatives + members

CREATE TABLE "AiInitiative" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'exploring',
    "ownerId" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiInitiative_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiInitiative_ownerId_idx" ON "AiInitiative"("ownerId");
CREATE INDEX "AiInitiative_status_idx" ON "AiInitiative"("status");

CREATE TABLE "AiInitiativeMember" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'follower',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiInitiativeMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiInitiativeMember_initiativeId_userId_key"
    ON "AiInitiativeMember"("initiativeId", "userId");
CREATE INDEX "AiInitiativeMember_userId_idx" ON "AiInitiativeMember"("userId");

ALTER TABLE "AiInitiativeMember" ADD CONSTRAINT "AiInitiativeMember_initiativeId_fkey"
    FOREIGN KEY ("initiativeId") REFERENCES "AiInitiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
