/*
  Warnings:

  - You are about to drop the column `icon` on the `challenges` table. All the data in the column will be lost.
  - You are about to drop the column `userProgressId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_PathToUserPathsList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `challenge_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `completed_challenges_list` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `path_challenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_apostle_relations_list` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_progress` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[metaId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_PathToUserPathsList" DROP CONSTRAINT "_PathToUserPathsList_A_fkey";

-- DropForeignKey
ALTER TABLE "_PathToUserPathsList" DROP CONSTRAINT "_PathToUserPathsList_B_fkey";

-- DropForeignKey
ALTER TABLE "challenge_results" DROP CONSTRAINT "challenge_results_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "challenge_results" DROP CONSTRAINT "challenge_results_userId_fkey";

-- DropForeignKey
ALTER TABLE "path_challenges" DROP CONSTRAINT "path_challenges_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "path_challenges" DROP CONSTRAINT "path_challenges_pathId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_completedChallengesId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_userAchievementsId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_userApostleRelationsId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_userNoteId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_userPathsId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_userProgressId_fkey";

-- DropIndex
DROP INDEX "users_userProgressId_key";

-- AlterTable
ALTER TABLE "challenges" DROP COLUMN "icon",
ADD COLUMN     "orderedTasks" TEXT[],
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "paths" ADD COLUMN     "challenges" TEXT[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "userProgressId",
ADD COLUMN     "metaId" TEXT;

-- DropTable
DROP TABLE "_PathToUserPathsList";

-- DropTable
DROP TABLE "challenge_results";

-- DropTable
DROP TABLE "completed_challenges_list";

-- DropTable
DROP TABLE "path_challenges";

-- DropTable
DROP TABLE "user_apostle_relations_list";

-- DropTable
DROP TABLE "user_progress";

-- CreateTable
CREATE TABLE "task_wrappers" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "apostleId" TEXT,

    CONSTRAINT "task_wrappers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_wrapper_results" (
    "id" TEXT NOT NULL,
    "taskWrapperId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,

    CONSTRAINT "task_wrapper_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_meta" (
    "id" TEXT NOT NULL,
    "completedTasks" TEXT[],
    "activeTasks" TEXT[],
    "pathsId" TEXT,
    "userChatsList" TEXT[],

    CONSTRAINT "user_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_meta_pathsId_key" ON "user_meta"("pathsId");

-- CreateIndex
CREATE UNIQUE INDEX "users_metaId_key" ON "users"("metaId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "user_meta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_wrappers" ADD CONSTRAINT "task_wrappers_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_wrappers" ADD CONSTRAINT "task_wrappers_apostleId_fkey" FOREIGN KEY ("apostleId") REFERENCES "apostles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_wrapper_results" ADD CONSTRAINT "task_wrapper_results_taskWrapperId_fkey" FOREIGN KEY ("taskWrapperId") REFERENCES "task_wrappers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_wrapper_results" ADD CONSTRAINT "task_wrapper_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_meta" ADD CONSTRAINT "user_meta_pathsId_fkey" FOREIGN KEY ("pathsId") REFERENCES "user_paths_list"("id") ON DELETE SET NULL ON UPDATE CASCADE;
