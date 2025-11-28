import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { serializeData } from "../provider";

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
						dialogue_id: "asc",
					},
					skip,
					take: limit,
				}),
				prisma.conversation_items.count({
					where: whereCondition,
				}),
			]);

			// 确保数据可序列化
			return createPaginatedResponse(serializeData(conversationItems), page, limit, total);
		} catch (error) {
			console.error(
				"Failed to fetch conversation items:",
				error instanceof Error ? error.message : String(error),
			);
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

			return createResponse(
				serializeData(conversationItem),
				"Conversation item fetched successfully",
			);
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
				const createdItems: any[] = [];
				for (const key in body) {
					for (const item of body[key]) {
						const conversationItem = await prisma.conversation_items.create({
							data: {
								id: crypto.randomUUID(), // 使用UUID生成唯一ID
								dialogue_id: item.dialogue_id,
								type: item.type,
								role: item.role,
								send_timestamp: item.send_timestamp ?? "",
								upper_text: item.upper_text,
								text_content: item.text_content,
								reference_id: item.reference_id,
								simple_content: item.simple_content,
								extra_class_name: item.extra_class_name,
								transfer_status: item.transfer_status,
								original_sender: item.original_sender ?? "",
								red_packet_status: item.red_packet_status,
								amount: item.amount ?? "",
								note: item.note ?? "",
								red_packet_id: item.red_packet_id ?? "",
								image_info: item.image_info,
								video_info: item.video_info,
								duration: item.duration ?? "",
								is_read: item.is_read ?? false,
								show_stt: item.show_stt ?? false,
								stt: item.stt ?? "",
								avatar_info: item.avatar_info ?? "",
								nickname: item.nickname ?? "",
							},
						});

						createdItems.push(conversationItem);
					}
				}
				return createResponse(
					serializeData(createdItems),
					"Conversation item(s) created successfully",
				);
			} catch (error) {
				console.error("Failed to create conversation item:", error);
				return createResponse(null, "Failed to create conversation item", -1);
			}
		},
		{
			body: t.Record(
				t.String(),
				t.Array(
					t.Object({
						id: t.String(),
						dialogue_id: t.String(),
						type: t.String(),
						role: t.String(),
						send_timestamp: t.Optional(t.String()),
						upper_text: t.Optional(t.String()),
						text_content: t.Optional(t.Any()),
						reference_id: t.Optional(t.String()),
						simple_content: t.Optional(t.String()),
						extra_class_name: t.Optional(t.String()),
						original_sender: t.Optional(t.String()),
						transfer_status: t.Optional(t.String()),
						amount: t.Optional(t.String()),
						note: t.Optional(t.String()),
						red_packet_status: t.Optional(t.String()),
						red_packet_id: t.Optional(t.String()),
						image_info: t.Optional(t.String()),
						video_info: t.Optional(t.String()),
						duration: t.Optional(t.String()),
						is_read: t.Optional(t.Boolean()),
						stt: t.Optional(t.String()),
						show_stt: t.Optional(t.Boolean()),
						avatar_info: t.Optional(t.String()),
						nickname: t.Optional(t.String()),
					}),
				),
			),
		},
	)

	// 更新conversation_item
	.put(
		"/:id",
		async ({ params, body, query }) => {
			const updatedConversations = [];

			const page = Number.parseInt(query.page as string) || 1;
			const limit = Number.parseInt(query.limit as string) || 50;
			const skip = (page - 1) * limit;

			for (const key in body) {
				for (const item of body[key]) {
					const conversation = await prisma.conversation_items.upsert({
						where: { id_dialogue_id: { id: item.id, dialogue_id: item.dialogue_id } },
						update: {
							type: item.type,
							role: item.role,
							send_timestamp: item.send_timestamp,
							upper_text: item.upper_text,
							text_content: item.text_content,
							reference_id: item.reference_id,
							simple_content: item.simple_content,
							extra_class_name: item.extra_class_name,
							original_sender: item.original_sender,
							transfer_status: item.transfer_status,
							amount: item.amount,
							note: item.note,
							red_packet_status: item.red_packet_status,
							red_packet_id: item.red_packet_id,
							image_info: item.image_info,
							video_info: item.video_info,
							duration: item.duration,
							is_read: item.is_read,
							show_stt: item.show_stt,
							stt: item.stt,
							avatar_info: item.avatar_info,
							nickname: item.nickname,
						},
						create: {
							id: item.id,
							dialogue_id: item.dialogue_id,
							type: item.type,
							role: item.role,
							send_timestamp: item.send_timestamp ?? "",
							upper_text: item.upper_text,
							text_content: item.text_content,
							reference_id: item.reference_id,
							simple_content: item.simple_content,
							extra_class_name: item.extra_class_name,
							original_sender: item.original_sender,
							transfer_status: item.transfer_status,
							amount: item.amount,
							note: item.note,
							red_packet_status: item.red_packet_status,
							red_packet_id: item.red_packet_id,
							image_info: item.image_info,
							video_info: item.video_info,
							duration: item.duration ?? "",
							is_read: item.is_read,
							show_stt: item.show_stt,
							stt: item.stt,
							avatar_info: item.avatar_info,
							nickname: item.nickname,
						},
					});
					updatedConversations.push(conversation);
				}
			}
			try {
				return createPaginatedResponse(
					serializeData(updatedConversations),
					page,
					limit,
					updatedConversations.length,
				);
			} catch (error) {
				console.error("Failed to update conversation items:", error);
				return createResponse(null, "Failed to update conversation items", -1);
			}
		},
		{
			body: t.Record(
				t.String(),
				t.Array(
					t.Object({
						id: t.String(),
						dialogue_id: t.String(),
						type: t.String(),
						role: t.String(),
						send_timestamp: t.Optional(t.String()),
						upper_text: t.Optional(t.String()),
						text_content: t.Optional(t.Any()),
						reference_id: t.Optional(t.String()),
						simple_content: t.Optional(t.String()),
						extra_class_name: t.Optional(t.String()),
						original_sender: t.Optional(t.String()),
						transfer_status: t.Optional(t.String()),
						amount: t.Optional(t.String()),
						note: t.Optional(t.String()),
						red_packet_status: t.Optional(t.String()),
						red_packet_id: t.Optional(t.String()),
						image_info: t.Optional(t.String()),
						video_info: t.Optional(t.String()),
						duration: t.Optional(t.String()),
						is_read: t.Optional(t.Boolean()),
						stt: t.Optional(t.String()),
						show_stt: t.Optional(t.Boolean()),
						avatar_info: t.Optional(t.String()),
						nickname: t.Optional(t.String()),
					}),
				),
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
