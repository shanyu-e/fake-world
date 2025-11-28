/*
  Warnings:

  - The `show_stt` column on the `conversation_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "conversation_items" DROP COLUMN "show_stt",
ADD COLUMN     "show_stt" BOOLEAN;
