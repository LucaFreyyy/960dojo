/*
  Warnings:

  - You are about to drop the `UserTacticProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTacticProgress" DROP CONSTRAINT "UserTacticProgress_tacticId_fkey";

-- DropForeignKey
ALTER TABLE "UserTacticProgress" DROP CONSTRAINT "UserTacticProgress_userId_fkey";

-- AlterTable
ALTER TABLE "UserOpening" ALTER COLUMN "finished" DROP NOT NULL;

-- DropTable
DROP TABLE "UserTacticProgress";

-- CreateTable
CREATE TABLE "UserTactic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tacticId" INTEGER NOT NULL,
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "finished" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTactic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTactic" ADD CONSTRAINT "UserTactic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTactic" ADD CONSTRAINT "UserTactic_tacticId_fkey" FOREIGN KEY ("tacticId") REFERENCES "Tactic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
