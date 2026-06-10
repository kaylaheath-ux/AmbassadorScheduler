-- CreateEnum
CREATE TYPE "HourLogStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "HourLog" DROP CONSTRAINT "HourLog_eventId_fkey";

-- AlterTable
ALTER TABLE "HourLog" DROP COLUMN "approved",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "minutes" INTEGER,
ADD COLUMN     "status" "HourLogStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "eventId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "HourLog" ADD CONSTRAINT "HourLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
