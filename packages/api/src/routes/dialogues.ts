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

export const dialoguesRoutes = new Elysia({ prefix: "/dialogues" })
	// 获取对话列表
	.get("/", async ({ query }) => {
		try {
			const profileId = query.profileId as string;
			const page = Number.parseInt(query.page as string) || 1;
			const limit = Number.parseInt(query.limit as string) || 20;
			const skip = (page - 1) * limit;

			const [dialogues, total] = await Promise.all([
				prisma.dialogue.findMany({
					where: { profileId },
					include: {
						friend: {
							select: {
								id: true,
								nickname: true,
								avatarInfo: true,
							},
						},
					},
					orderBy: {
						lastMessageTime: "desc",
					},
					skip,
					take: limit,
				}),
				prisma.dialogue.count({
					where: { profileId },
				}),
			]);

			return createPaginatedResponse(dialogues, page, limit, total);
		} catch (error) {
			return createResponse(null, "Failed to fetch dialogues", -1);
		}
	})

	// 获取单个对话
	.get("/:id", async ({ params }) => {
		try {
			const dialogue = await prisma.dialogue.findUnique({
				where: { id: params.id },
				include: {
					friend: {
						select: {
							id: true,
							nickname: true,
							avatarInfo: true,
						},
					},
				},
			});

			if (!dialogue) {
				return createResponse(null, "Dialogue not found", -1);
			}

			return createResponse(dialogue);
		} catch (error) {
			return createResponse(null, "Failed to fetch dialogue", -1);
		}
	})

	// 创建对话
	.post(
		"/",
		async ({ body }) => {
			try {
				const dialogue = await prisma.dialogue.create({
					data: {
						id: crypto.randomUUID(),
						...body,
					},
					include: {
						friend: {
							select: {
								id: true,
								nickname: true,
								avatarInfo: true,
							},
						},
					},
				});

				return createResponse(dialogue, "Dialogue created successfully");
			} catch (error) {
				return createResponse(null, "Failed to create dialogue", -1);
			}
		},
		{
			body: t.Object({
				profileId: t.String(),
				friendId: t.String(),
				lastMessage: t.Optional(t.String()),
				lastMessageTime: t.Optional(t.Date()),
				isPinned: t.Optional(t.Boolean()),
				isMuted: t.Optional(t.Boolean()),
				badgeHide: t.Optional(t.Boolean()),
				unreadMarkNumber: t.Optional(t.Number()),
				unreadDisplayType: t.Optional(t.String()),
			}),
		},
	)

	// 更新对话
	.put(
		"/:id",
		async ({ params, body }) => {
			try {
				const dialogue = await prisma.dialogue.update({
					where: { id: params.id },
					data: body,
					include: {
						friend: {
							select: {
								id: true,
								nickname: true,
								avatarInfo: true,
							},
						},
					},
				});

				return createResponse(dialogue, "Dialogue updated successfully");
			} catch (error) {
				return createResponse(null, "Failed to update dialogue", -1);
			}
		},
		{
			body: t.Object({
				lastMessage: t.Optional(t.String()),
				lastMessageTime: t.Optional(t.Date()),
				isPinned: t.Optional(t.Boolean()),
				isMuted: t.Optional(t.Boolean()),
				badgeHide: t.Optional(t.Boolean()),
				unreadMarkNumber: t.Optional(t.Number()),
				unreadDisplayType: t.Optional(t.String()),
			}),
		},
	)

	// 删除对话
	.delete("/:id", async ({ params }) => {
		try {
			await prisma.dialogue.delete({
				where: { id: params.id },
			});

			return createResponse(null, "Dialogue deleted successfully");
		} catch (error) {
			return createResponse(null, "Failed to delete dialogue", -1);
		}
	});
