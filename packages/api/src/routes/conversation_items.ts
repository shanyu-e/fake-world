import { Elysia, t } from "elysia";
import { prisma } from "../db";

interface ApiResponse<T> {
	data: T;
	message: string;
	code: number;
	timestamp: number;
}

interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

const createResponse = <T>(data: T, message = "Success", code = 0): ApiResponse<T> => ({
	data,
	message,
	code,
	timestamp: Date.now(),
});

const createPaginatedResponse = <T>(
	data: T[],
	page: number,
	limit: number,
	total: number,
): ApiResponse<PaginatedResponse<T>> => ({
	data: {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	},
	message: "Success",
	code: 0,
	timestamp: Date.now(),
});

export const conversationItemsRoutes = new Elysia({ prefix: "/conversation_items" })
	// 获取conversation_items列表
	.get("/", async ({ query }) => {
		try {
			const id = (query.id as string) || undefined;
			const dialogueId = (query.dialogue_id as string) || undefined;
			const type = (query.type as string) || undefined;
			const role = (query.role as string) || undefined;
			const page = Number.parseInt(query.page as string) || 1;
			const limit = Number.parseInt(query.limit as string) || 50;
			const skip = (page - 1) * limit;

			// 构建查询条件
			const whereCondition = {
				...(id ? { id } : {}),
				...(dialogueId ? { dialogue_id: dialogueId } : {}),
				...(type ? { type } : {}),
				...(role ? { role } : {}),
			};

			const [conversationItems, total] = await Promise.all([
				prisma.conversation_items.findMany({
					where: whereCondition,
					orderBy: {
						send_timestamp: "desc",
					},
					skip,
					take: limit,
				}),
				prisma.conversation_items.count({
					where: whereCondition,
				}),
			]);

			return createPaginatedResponse(conversationItems, page, limit, total);
		} catch (error) {
			console.error("Failed to fetch conversation items:", error);
			return createResponse(null, "Failed to fetch conversation items", -1);
		}
	})

	// 获取单个conversation_item
	.get("/:id", async ({ params, query }) => {
		try {
			const conversationItem = await prisma.conversation_items.findUnique({
				where: {
					id_dialogue_id: {
						id: params.id,
						dialogue_id: query.dialogue_id as string,
					},
				},
			});

			if (!conversationItem) {
				return createResponse(null, "Conversation item not found", -1);
			}

			return createResponse(conversationItem);
		} catch (error) {
			console.error("Failed to fetch conversation item:", error);
			return createResponse(null, "Failed to fetch conversation item", -1);
		}
	})

	// 创建新的conversation_item
	.post(
		"/",
		async ({ body }) => {
			try {
				const conversationItem = await prisma.conversation_items.create({
					data: {
						id: crypto.randomUUID(),
						...body,
					},
				});

				return createResponse(conversationItem, "Conversation item created successfully");
			} catch (error) {
				console.error("Failed to create conversation item:", error);
				return createResponse(null, "Failed to create conversation item", -1);
			}
		},
		{
			body: t.Object({
				dialogue_id: t.String(),
				type: t.String(),
				role: t.String(),
				send_timestamp: t.Optional(t.BigInt()),
				upper_text: t.Optional(t.String()),
				text_content: t.Optional(t.Any()),
				reference_id: t.Optional(t.String()),
				simple_content: t.Optional(t.String()),
				extra_class_name: t.Optional(t.String()),
				original_sender: t.Optional(t.String()),
				transfer_status: t.Optional(t.String()),
				transfer_amount: t.Optional(t.String()), // 使用String因为Decimal类型在API传输中需要特殊处理
				transfer_note: t.Optional(t.String()),
				red_packet_original_sender: t.Optional(t.String()),
				red_packet_status: t.Optional(t.String()),
				red_packet_amount: t.Optional(t.String()), // 使用String因为Decimal类型在API传输中需要特殊处理
				red_packet_note: t.Optional(t.String()),
				red_packet_id: t.Optional(t.String()),
				image_info: t.Optional(t.String()),
				video_info: t.Optional(t.String()),
				voice_duration: t.Optional(t.Number()),
				voice_is_read: t.Optional(t.Boolean()),
				voice_show_stt: t.Optional(t.Boolean()),
				voice_stt: t.Optional(t.String()),
				personal_card_avatar_info: t.Optional(t.String()),
				personal_card_nickname: t.Optional(t.String()),
			}),
		},
	)

	// 更新conversation_item
	.put(
		"/:id",
		async ({ params, body, query }) => {
			try {
				const dialogueId = query.dialogue_id as string;

				if (!dialogueId) {
					return createResponse(null, "dialogue_id is required", -1);
				}

				const updatedConversationItem = await prisma.conversation_items.update({
					where: {
						id_dialogue_id: {
							id: params.id,
							dialogue_id: dialogueId,
						},
					},
					data: body,
				});

				return createResponse(updatedConversationItem, "Conversation item updated successfully");
			} catch (error) {
				console.error("Failed to update conversation item:", error);
				return createResponse(null, "Failed to update conversation item", -1);
			}
		},
		{
			body: t.Partial(
				t.Object({
					type: t.String(),
					role: t.String(),
					send_timestamp: t.Optional(t.BigInt()),
					upper_text: t.Optional(t.String()),
					text_content: t.Optional(t.Any()),
					reference_id: t.Optional(t.String()),
					simple_content: t.Optional(t.String()),
					extra_class_name: t.Optional(t.String()),
					original_sender: t.Optional(t.String()),
					transfer_status: t.Optional(t.String()),
					transfer_amount: t.Optional(t.String()),
					transfer_note: t.Optional(t.String()),
					red_packet_original_sender: t.Optional(t.String()),
					red_packet_status: t.Optional(t.String()),
					red_packet_amount: t.Optional(t.String()),
					red_packet_note: t.Optional(t.String()),
					red_packet_id: t.Optional(t.String()),
					image_info: t.Optional(t.String()),
					video_info: t.Optional(t.String()),
					voice_duration: t.Optional(t.Number()),
					voice_is_read: t.Optional(t.Boolean()),
					voice_show_stt: t.Optional(t.Boolean()),
					voice_stt: t.Optional(t.String()),
					personal_card_avatar_info: t.Optional(t.String()),
					personal_card_nickname: t.Optional(t.String()),
				}),
			),
		},
	)

	// 删除conversation_item
	.delete("/:id", async ({ params, query }) => {
		try {
			const dialogueId = query.dialogue_id as string;

			if (!dialogueId) {
				return createResponse(null, "dialogue_id is required", -1);
			}

			await prisma.conversation_items.delete({
				where: {
					id_dialogue_id: {
						id: params.id,
						dialogue_id: dialogueId,
					},
				},
			});

			return createResponse(null, "Conversation item deleted successfully");
		} catch (error) {
			console.error("Failed to delete conversation item:", error);
			return createResponse(null, "Failed to delete conversation item", -1);
		}
	});
