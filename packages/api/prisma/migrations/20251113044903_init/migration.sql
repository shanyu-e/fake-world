-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "remark" TEXT,
    "avatarInfo" TEXT,
    "momentsBackgroundInfo" TEXT,
    "momentsBackgroundLike" BOOLEAN NOT NULL DEFAULT false,
    "momentsPrivacy" TEXT NOT NULL DEFAULT 'all',
    "tickleText" TEXT,
    "wechat" TEXT NOT NULL,
    "coin" INTEGER NOT NULL DEFAULT 0,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT,
    "hideGender" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT[],
    "tags" TEXT[],
    "description" TEXT,
    "area" TEXT,
    "signature" TEXT,
    "privacy" TEXT NOT NULL DEFAULT 'all',
    "thumbnailInfo" TEXT[],
    "hideThumbnail" BOOLEAN NOT NULL DEFAULT false,
    "createdByFaker" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "miniFund" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "miniFundYield" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dialogues" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "lastMessage" TEXT,
    "lastMessageTime" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "badgeHide" BOOLEAN NOT NULL DEFAULT false,
    "unreadMarkNumber" INTEGER NOT NULL DEFAULT 0,
    "unreadDisplayType" TEXT NOT NULL DEFAULT 'number',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "dialogueId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB,
    "upperText" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "feeds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "sendTimestamp" BIGINT NOT NULL,
    "likeUserIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_comments" (
    "id" TEXT NOT NULL,
    "feedId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "replyUserId" TEXT,
    "content" JSONB NOT NULL,
    "sendTimestamp" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "code" TEXT,
    "paymentMethod" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" BIGINT,
    "mimeType" TEXT,
    "filePath" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_items" (
    "id" VARCHAR(64) NOT NULL,
    "dialogue_id" VARCHAR(64) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "role" VARCHAR(16) NOT NULL,
    "send_timestamp" INTEGER,
    "upper_text" TEXT,
    "text_content" JSONB,
    "reference_id" VARCHAR(64),
    "simple_content" TEXT,
    "extra_class_name" TEXT,
    "original_sender" VARCHAR(16),
    "transfer_status" VARCHAR(16),
    "transfer_amount" DECIMAL(18,2),
    "transfer_note" TEXT,
    "red_packet_original_sender" VARCHAR(16),
    "red_packet_status" VARCHAR(16),
    "red_packet_amount" DECIMAL(18,2),
    "red_packet_note" TEXT,
    "red_packet_id" VARCHAR(64),
    "image_info" TEXT,
    "video_info" TEXT,
    "voice_duration" INTEGER,
    "voice_is_read" BOOLEAN,
    "voice_show_stt" BOOLEAN,
    "voice_stt" TEXT,
    "personal_card_avatar_info" TEXT,
    "personal_card_nickname" TEXT
);

-- CreateTable
CREATE TABLE "_FeedLikes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FeedLikes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_wechat_key" ON "profiles"("wechat");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_profileId_key" ON "wallets"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_unique" ON "conversations"("id", "dialogueId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_items_1_unique" ON "conversation_items"("id", "dialogue_id");

-- CreateIndex
CREATE INDEX "_FeedLikes_B_index" ON "_FeedLikes"("B");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "feeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeedLikes" ADD CONSTRAINT "_FeedLikes_A_fkey" FOREIGN KEY ("A") REFERENCES "feeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeedLikes" ADD CONSTRAINT "_FeedLikes_B_fkey" FOREIGN KEY ("B") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
