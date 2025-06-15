/*
  Warnings:

  - You are about to drop the column `keywords` on the `apostles` table. All the data in the column will be lost.
  - You are about to drop the column `strengths` on the `apostles` table. All the data in the column will be lost.
  - You are about to drop the column `traits` on the `apostles` table. All the data in the column will be lost.
  - You are about to drop the column `virtue` on the `apostles` table. All the data in the column will be lost.
  - You are about to drop the column `welcomeMessage` on the `apostles` table. All the data in the column will be lost.
  - You are about to drop the column `emotion` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `currentApostleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `totalDays` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `missions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `weekly_tasks` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userProgressId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `apostles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatId` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('USER', 'APOSTLE');

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_apostleId_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_userId_fkey";

-- DropForeignKey
ALTER TABLE "missions" DROP CONSTRAINT "missions_apostleId_fkey";

-- DropForeignKey
ALTER TABLE "missions" DROP CONSTRAINT "missions_userId_fkey";

-- DropForeignKey
ALTER TABLE "weekly_tasks" DROP CONSTRAINT "weekly_tasks_apostleId_fkey";

-- AlterTable
ALTER TABLE "apostles" DROP COLUMN "keywords",
DROP COLUMN "strengths",
DROP COLUMN "traits",
DROP COLUMN "virtue",
DROP COLUMN "welcomeMessage",
ADD COLUMN     "phraseSetsId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "virtueId" TEXT;

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "emotion",
DROP COLUMN "keywords",
DROP COLUMN "role",
DROP COLUMN "timestamp",
DROP COLUMN "userId",
ADD COLUMN     "chatId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "relatedChallengeId" TEXT,
ADD COLUMN     "sender" "MessageSender" NOT NULL,
ADD COLUMN     "voiceUrl" TEXT,
ALTER COLUMN "apostleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "currentApostleId",
DROP COLUMN "totalDays",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "currentSubscription" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "salt" TEXT NOT NULL,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "userProgressId" TEXT;

-- DropTable
DROP TABLE "missions";

-- DropTable
DROP TABLE "user_stats";

-- DropTable
DROP TABLE "weekly_tasks";

-- CreateTable
CREATE TABLE "paths" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_challenges" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "path_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "apostleId" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apostleId" TEXT NOT NULL,
    "pathId" TEXT,
    "currentChallengeId" TEXT,
    "phraseSetsId" TEXT,
    "currentChatPresetId" TEXT,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phrase_sets" (
    "id" TEXT NOT NULL,
    "phraseIds" TEXT[],

    CONSTRAINT "phrase_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apostle_phrase_sets" (
    "id" TEXT NOT NULL,
    "phraseSetIds" TEXT[],

    CONSTRAINT "apostle_phrase_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_presets" (
    "id" TEXT NOT NULL,
    "textPrompt" TEXT NOT NULL,

    CONSTRAINT "chat_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_results" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,

    CONSTRAINT "challenge_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "completedChallengesId" TEXT,
    "userPathsId" TEXT,
    "userApostleRelationsId" TEXT,
    "userNoteId" TEXT,
    "userAchievementsId" TEXT,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_apostle_relations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apostleId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relationshipLevel" INTEGER NOT NULL DEFAULT 1,
    "lastInteraction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_apostle_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_apostle_relations_list" (
    "id" TEXT NOT NULL,
    "userApostleRelationIds" TEXT[],

    CONSTRAINT "user_apostle_relations_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phrases" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "chapter" TEXT,
    "tags" TEXT[],

    CONSTRAINT "phrases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mood" TEXT,
    "note" TEXT,

    CONSTRAINT "user_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completed_challenges_list" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedChallengeIds" TEXT[],
    "currentChallengeId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "completed_challenges_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_paths_list" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activePathIds" TEXT[],
    "completedPathIds" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_paths_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements_list" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementIds" TEXT[],

    CONSTRAINT "user_achievements_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PathToUserPathsList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AchievementToUserAchievementsList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ApostlePhraseSetsToPhraseSet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "path_challenges_pathId_challengeId_key" ON "path_challenges"("pathId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "features_feature_key" ON "features"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_completedChallengesId_key" ON "user_progress"("completedChallengesId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userPathsId_key" ON "user_progress"("userPathsId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userApostleRelationsId_key" ON "user_progress"("userApostleRelationsId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userNoteId_key" ON "user_progress"("userNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userAchievementsId_key" ON "user_progress"("userAchievementsId");

-- CreateIndex
CREATE UNIQUE INDEX "user_apostle_relations_userId_apostleId_key" ON "user_apostle_relations"("userId", "apostleId");

-- CreateIndex
CREATE UNIQUE INDEX "_PathToUserPathsList_AB_unique" ON "_PathToUserPathsList"("A", "B");

-- CreateIndex
CREATE INDEX "_PathToUserPathsList_B_index" ON "_PathToUserPathsList"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AchievementToUserAchievementsList_AB_unique" ON "_AchievementToUserAchievementsList"("A", "B");

-- CreateIndex
CREATE INDEX "_AchievementToUserAchievementsList_B_index" ON "_AchievementToUserAchievementsList"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ApostlePhraseSetsToPhraseSet_AB_unique" ON "_ApostlePhraseSetsToPhraseSet"("A", "B");

-- CreateIndex
CREATE INDEX "_ApostlePhraseSetsToPhraseSet_B_index" ON "_ApostlePhraseSetsToPhraseSet"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_userProgressId_key" ON "users"("userProgressId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userProgressId_fkey" FOREIGN KEY ("userProgressId") REFERENCES "user_progress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_challenges" ADD CONSTRAINT "path_challenges_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_challenges" ADD CONSTRAINT "path_challenges_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_apostleId_fkey" FOREIGN KEY ("apostleId") REFERENCES "apostles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apostles" ADD CONSTRAINT "apostles_virtueId_fkey" FOREIGN KEY ("virtueId") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apostles" ADD CONSTRAINT "apostles_phraseSetsId_fkey" FOREIGN KEY ("phraseSetsId") REFERENCES "apostle_phrase_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_apostleId_fkey" FOREIGN KEY ("apostleId") REFERENCES "apostles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "paths"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_currentChallengeId_fkey" FOREIGN KEY ("currentChallengeId") REFERENCES "challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_currentChatPresetId_fkey" FOREIGN KEY ("currentChatPresetId") REFERENCES "chat_presets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_results" ADD CONSTRAINT "challenge_results_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_results" ADD CONSTRAINT "challenge_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_completedChallengesId_fkey" FOREIGN KEY ("completedChallengesId") REFERENCES "completed_challenges_list"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userPathsId_fkey" FOREIGN KEY ("userPathsId") REFERENCES "user_paths_list"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userApostleRelationsId_fkey" FOREIGN KEY ("userApostleRelationsId") REFERENCES "user_apostle_relations_list"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userNoteId_fkey" FOREIGN KEY ("userNoteId") REFERENCES "user_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userAchievementsId_fkey" FOREIGN KEY ("userAchievementsId") REFERENCES "user_achievements_list"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_apostle_relations" ADD CONSTRAINT "user_apostle_relations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_apostle_relations" ADD CONSTRAINT "user_apostle_relations_apostleId_fkey" FOREIGN KEY ("apostleId") REFERENCES "apostles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_apostleId_fkey" FOREIGN KEY ("apostleId") REFERENCES "apostles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_relatedChallengeId_fkey" FOREIGN KEY ("relatedChallengeId") REFERENCES "challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PathToUserPathsList" ADD CONSTRAINT "_PathToUserPathsList_A_fkey" FOREIGN KEY ("A") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PathToUserPathsList" ADD CONSTRAINT "_PathToUserPathsList_B_fkey" FOREIGN KEY ("B") REFERENCES "user_paths_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementToUserAchievementsList" ADD CONSTRAINT "_AchievementToUserAchievementsList_A_fkey" FOREIGN KEY ("A") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementToUserAchievementsList" ADD CONSTRAINT "_AchievementToUserAchievementsList_B_fkey" FOREIGN KEY ("B") REFERENCES "user_achievements_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApostlePhraseSetsToPhraseSet" ADD CONSTRAINT "_ApostlePhraseSetsToPhraseSet_A_fkey" FOREIGN KEY ("A") REFERENCES "apostle_phrase_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApostlePhraseSetsToPhraseSet" ADD CONSTRAINT "_ApostlePhraseSetsToPhraseSet_B_fkey" FOREIGN KEY ("B") REFERENCES "phrase_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
