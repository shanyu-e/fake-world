import { Elysia, t } from "elysia";
import { prisma } from "../db";

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

export const walletRoutes = new Elysia({ prefix: "/wallet" })
	// 获取所有钱包信息
	.get("/", async () => {
		try {
			const wallets = await prisma.wallet.findMany({
				orderBy: {
					createdAt: "desc",
				},
			});
			return createResponse(wallets);
		} catch (error) {
			return createResponse(null, "Failed to fetch wallets", -1);
		}
	})
	// 获取单个钱包信息
	.get("/:profileId", async ({ params }) => {
		try {
			let wallet = await prisma.wallet.findUnique({
				where: { profileId: params.profileId },
			});

			// 如果钱包不存在，创建一个默认钱包
			if (!wallet) {
				wallet = await prisma.wallet.create({
					data: {
						id: crypto.randomUUID(),
						profileId: params.profileId,
						balance: 520.0,
						miniFund: 1314.0,
						miniFundYield: 2.75,
					},
				});
			}

			return createResponse(wallet);
		} catch (error) {
			return createResponse(null, "Failed to fetch wallet", -1);
		}
	})

	// 更新钱包信息
	.put(
		"/:profileId",
		async ({ params, body }) => {
			try {
				const wallet = await prisma.wallet.upsert({
					where: { profileId: params.profileId },
					update: body,
					create: {
						id: crypto.randomUUID(),
						profileId: params.profileId,
						...body,
					},
				});

				return createResponse(wallet, "Wallet updated successfully");
			} catch (error) {
				return createResponse(null, "Failed to update wallet", -1);
			}
		},
		{
			body: t.Object({
				balance: t.Optional(t.Number()),
				miniFund: t.Optional(t.Number()),
				miniFundYield: t.Optional(t.Number()),
			}),
		},
	);
