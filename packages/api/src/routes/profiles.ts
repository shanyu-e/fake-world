import { Elysia, t } from "elysia";
import { prisma } from "../db";

// 统一响应格式
interface ApiResponse<T> {
	data: T;
	message: string;
	code: number;
	timestamp: number;
}

const createResponse = <T>(data: T, message = "Success", code = 0): ApiResponse<T> => ({
	data,
	message,
	code,
	timestamp: Date.now(),
});

export const profilesRoutes = new Elysia({ prefix: "/profiles" })
	// 获取所有用户档案
	.get("/", async () => {
		try {
			const profiles = await prisma.profile.findMany({
				include: {
					wallet: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});
			return createResponse(profiles);
		} catch (error) {
			return createResponse(null, "Failed to fetch profiles", -1);
		}
	})

	// 获取单个用户档案
	.get("/:id", async ({ params }) => {
		try {
			const profile = await prisma.profile.findUnique({
				where: { id: params.id },
				include: {
					wallet: true,
				},
			});

			if (!profile) {
				return createResponse(null, "Profile not found", -1);
			}

			return createResponse(profile);
		} catch (error) {
			return createResponse(null, "Failed to fetch profile", -1);
		}
	})

	// 创建用户档案
	.post(
		"/",
		async ({ body }) => {
			try {
				const profile = await prisma.profile.create({
					data: {
						...body,
						id: crypto.randomUUID(),
					},
					include: {
						wallet: true,
					},
				});

				return createResponse(profile, "Profile created successfully");
			} catch (error) {
				return createResponse(null, "Failed to create profile", -1);
			}
		},
		{
			body: t.Object({
				nickname: t.String(),
				remark: t.Optional(t.String()),
				avatarInfo: t.Optional(t.String()),
				wechat: t.String(),
				// 其他可选字段...
			}),
		},
	)

	// 更新用户档案
	.put(
		"/:id",
		async ({ params, body }) => {
			try {
				const profile = await prisma.profile.update({
					where: { id: params.id },
					data: body,
					include: {
						wallet: true,
					},
				});

				return createResponse(profile, "Profile updated successfully");
			} catch (error) {
				return createResponse(null, "Failed to update profile", -1);
			}
		},
		{
			body: t.Object({
				nickname: t.Optional(t.String()),
				remark: t.Optional(t.String()),
				avatarInfo: t.Optional(t.String()),
				// 其他可选字段...
			}),
		},
	)

	// 删除用户档案
	.delete("/:id", async ({ params }) => {
		try {
			await prisma.profile.delete({
				where: { id: params.id },
			});

			return createResponse(null, "Profile deleted successfully");
		} catch (error) {
			return createResponse(null, "Failed to delete profile", -1);
		}
	});
