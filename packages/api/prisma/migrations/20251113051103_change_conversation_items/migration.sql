/*
  Warnings:

  - You are about to drop the column `personal_card_avatar_info` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `personal_card_nickname` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `red_packet_amount` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `red_packet_note` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `red_packet_original_sender` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `transfer_amount` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `transfer_note` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `voice_duration` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `voice_is_read` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `voice_show_stt` on the `conversation_items` table. All the data in the column will be lost.
  - You are about to drop the column `voice_stt` on the `conversation_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conversation_items" DROP COLUMN "personal_card_avatar_info",
DROP COLUMN "personal_card_nickname",
DROP COLUMN "red_packet_amount",
DROP COLUMN "red_packet_note",
DROP COLUMN "red_packet_original_sender",
DROP COLUMN "transfer_amount",
DROP COLUMN "transfer_note",
DROP COLUMN "voice_duration",
DROP COLUMN "voice_is_read",
DROP COLUMN "voice_show_stt",
DROP COLUMN "voice_stt",
ADD COLUMN     "amount" DECIMAL(18,2),
ADD COLUMN     "avatar_info" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "is_read" BOOLEAN,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "show_stt" TEXT,
ADD COLUMN     "stt" TEXT;
