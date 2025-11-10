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

export const conversationsRoutes = new Elysia({ prefix: "/conversations" })
	// 获取聊天记录
	.get("/", async ({ query }) => {
		try {
			const id = (query.id as string) || undefined;
			const dialogueId = (query.dialogueId as string) || undefined;
			const page = Number.parseInt(query.page as string) || 1;
			const limit = Number.parseInt(query.limit as string) || 50;
			const skip = (page - 1) * limit;

			const [conversations, total] = await Promise.all([
				prisma.conversation.findMany({
					where: {
						AND: [{ id }, { dialogueId }],
					},
					orderBy: {
						dialogueId: "asc",
					},
					skip,
					take: limit,
				}),
				prisma.conversation.count({
					where: { dialogueId },
				}),
			]);

			return createPaginatedResponse(conversations, page, limit, total);
		} catch (error) {
			return createResponse(null, "Failed to fetch conversations", -1);
		}
	})

	// 获取单个聊天记录
	.get("/:id", async ({ params, query }) => {
		try {
			const conversation = await prisma.conversation.findUnique({
				where: { id_dialogueId: { id: params.id, dialogueId: query.dialogueId as string } },
			});

			if (!conversation) {
				return createResponse(null, "Conversation not found", -1);
			}

			return createResponse(conversation);
		} catch (error) {
			return createResponse(null, "Failed to fetch conversation", -1);
		}
	})

	// 发送消息
	.post(
		"/",
		async ({ body }) => {
			try {
				const conversation = await prisma.conversation.create({
					data: {
						id: crypto.randomUUID(),
						...body,
					},
				});

				// 更新对话的最后消息
				await prisma.dialogue.update({
					where: { id: body.dialogueId },
					data: {
						lastMessage:
							typeof body.content === "string" ? body.content : JSON.stringify(body.content),
						lastMessageTime: new Date(),
					},
				});

				return createResponse(conversation, "Message sent successfully");
			} catch (error) {
				return createResponse(null, "Failed to send message", -1);
			}
		},
		{
			body: t.Object({
				dialogueId: t.String(),
				role: t.String(),
				type: t.String(),
				content: t.Any(),
				upperText: t.Optional(t.String()),
				referenceId: t.Optional(t.String()),
			}),
		},
	)

	// 更新消息
	.put(
		"/:id",
		async ({ params, body }) => {
			try {
				const updatedConversations = [];
				for (const key in body) {
					if (body[key] === undefined) {
						delete body[key];
						continue;
					}
					for (const item of body[key]) {
						const conversation = await prisma.conversation.upsert({
							//  upsert 操作，根据 id 和 dialogueId li 唯一确定一条记录
							where: { id_dialogueId: { id: item.id, dialogueId: item.dialogueId } },
							update: {
								role: item.role,
								type: item.type,
								upperText: item.upperText,
								content: item.textContent,
								referenceId: item.referenceId,
							},
							create: {
								id: item.id,
								dialogueId: item.dialogueId,
								role: item.role,
								type: item.type,
								upperText: item.upperText,
								content: item.textContent,
								referenceId: item.referenceId,
							},
						});
						updatedConversations.push(conversation);
					}
				}

				return createResponse(updatedConversations, "Messages updated successfully");
			} catch (error) {
				return createResponse(null, "Failed to update message", -1);
			}
		},
		{
			body: t.Record(
				t.String(), // 键类型：IStateProfile["id"] (字符串)
				t.Array(
					t.Object({
						id: t.String(),
						dialogueId: t.String(),
						type: t.String(),
						role: t.String(),
						upperText: t.Optional(t.String()),
						// 根据 TConversationItem 类型添加其他可能的字段
						textContent: t.Optional(t.Any()),
						referenceId: t.Optional(t.String()),
					}),
				), // 值类型：TStateConversationList (TConversationItem[])
			),
		},
	)

	// 删除消息
	.delete("/:id", async ({ params, query }) => {
		try {
			await prisma.conversation.delete({
				where: { id_dialogueId: { id: params.id, dialogueId: query.dialogueId as string } },
			});

			return createResponse(null, "Message deleted successfully");
		} catch (error) {
			return createResponse(null, "Failed to delete message", -1);
		}
	});
