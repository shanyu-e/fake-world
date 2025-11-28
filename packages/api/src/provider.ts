import { createOpenAI } from "@ai-sdk/openai";
import { env } from "bun";

export const openai = createOpenAI({
	baseURL: env.OPENAI_baseURL,
	apiKey: env.OPENAI_apiKey,
	compatibility: "compatible",
});

export const serializeData = (data: any) => {
	return JSON.parse(
		JSON.stringify(data, (key, value) => {
			if (typeof value === "bigint") {
				return value.toString();
			}
			// 还可以处理其他特殊类型
			return value;
		}),
	);
};
