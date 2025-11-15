import { config } from "dotenv";
import { PrismaClient } from "../generated/prisma/client";

// 加载环境变量
config({ path: ".env.local" });

export const prisma = new PrismaClient({
	log: ["query", "info", "warn", "error"],
});

// 优雅关闭
process.on("beforeExit", async () => {
	await prisma.$disconnect();
});

export default prisma;
