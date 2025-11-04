import { HybridDataSource } from "./sources/HybridDataSource";
import { LocalDataSource } from "./sources/LocalDataSource";
import { RemoteDataSource } from "./sources/RemoteDataSource";
import type { IDataSource } from "./types/IDataSource";

// 数据源配置
export interface DataSourceConfig {
	mode: "local" | "remote" | "hybrid";
	apiBaseUrl: string;
	syncInterval?: number;
	offlineMode?: boolean;
	syncOnRead?: boolean;
	syncOnWrite?: boolean;
}

// 默认配置
const defaultConfig: DataSourceConfig = {
	mode: "local",
	apiBaseUrl: import.meta.env.VITE_API_URL || "http://100.64.0.3:9000",
	syncInterval: 30000, // 30秒
	offlineMode: false,
	syncOnRead: true,
	syncOnWrite: true,
};

// 从环境变量获取配置
const getConfig = (): DataSourceConfig => {
	const mode = import.meta.env.VITE_DATA_SOURCE_MODE || "remote";
	const apiBaseUrl = import.meta.env.VITE_API_URL || "http://100.64.0.3:9000";
	const syncInterval = Number.parseInt(import.meta.env.VITE_SYNC_INTERVAL || "30000");
	const offlineMode = import.meta.env.VITE_OFFLINE_MODE === "true";
	const syncOnRead = import.meta.env.VITE_SYNC_ON_READ !== "false";
	const syncOnWrite = import.meta.env.VITE_SYNC_ON_WRITE !== "false";

	return {
		mode: mode as "local" | "remote" | "hybrid",
		apiBaseUrl,
		syncInterval,
		offlineMode,
		syncOnRead,
		syncOnWrite,
	};
};

// 数据源工厂
export function createDataSource<T>(
	key: string,
	endpoint: string,
	customConfig?: Partial<DataSourceConfig>,
): IDataSource<T> {
	const config = { ...defaultConfig, ...getConfig(), ...customConfig };

	switch (config.mode) {
		case "remote":
			return new RemoteDataSource<T>(`${config.apiBaseUrl}/api/v1${endpoint}`);

		case "hybrid":
			return new HybridDataSource<T>(key, `${config.apiBaseUrl}/api/v1${endpoint}`, {
				syncOnRead: config.syncOnRead,
				syncOnWrite: config.syncOnWrite,
				offlineMode: config.offlineMode,
			});

		// case "local":
		default:
			return new LocalDataSource<T>(key);
	}
}

import { dataSourceConfigAtom } from "@/stateV2/dataSourceConfig";
import type { Getter } from "jotai";

// 预定义的数据源
export const dataSources = {
	// 用户档案
	profiles: (get: Getter) =>
		createDataSource<any>("profiles", "/profiles", get(dataSourceConfigAtom)),

	// 钱包（单个）
	wallet: (get: Getter) => createDataSource<any>("wallet", "/wallet", get(dataSourceConfigAtom)),

	// 所有钱包
	allWallets: (get: Getter) =>
		createDataSource<any>("allWallets", "/wallet", get(dataSourceConfigAtom)),

	// 对话列表
	dialogues: (get: Getter) =>
		createDataSource<any>("dialogues", "/dialogues", get(dataSourceConfigAtom)),

	// 聊天记录
	conversations: (get: Getter) =>
		createDataSource<any>("conversations", "/conversations", get(dataSourceConfigAtom)),

	// 朋友圈
	feeds: (get: Getter) => createDataSource<any>("feeds", "/feeds", get(dataSourceConfigAtom)),

	// 交易记录
	transactions: (get: Getter) =>
		createDataSource<any>("transactions", "/transactions", get(dataSourceConfigAtom)),

	// 资源文件
	assets: (get: Getter) => createDataSource<any>("assets", "/assets", get(dataSourceConfigAtom)),
};

export default dataSources;
