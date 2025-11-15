import { EConversationType } from "./typing";

export const ConversationTypeLabel = {
	[EConversationType.text]: "文本",
	[EConversationType.image]: "图片",
	[EConversationType.transfer]: "转账",
	[EConversationType.redPacket]: "红包",
	[EConversationType.personalCard]: "个人名片",
	[EConversationType.voice]: "语音消息",
	[EConversationType.video]: "视频",
	[EConversationType.centerText]: "居中文本",
	[EConversationType.redPacketAcceptedReply]: "红包领取成功消息",
};
