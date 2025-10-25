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
	apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:9000",
	syncInterval: 30000, // 30秒
	offlineMode: false,
	syncOnRead: true,
	syncOnWrite: true,
};

// 从环境变量获取配置
const getConfig = (): DataSourceConfig => {
	const mode = import.meta.env.VITE_DATA_SOURCE_MODE || "local";
	const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:9000";
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

// 预定义的数据源
export const dataSources = {
	// 用户档案
	profiles: (config?: Partial<DataSourceConfig>) =>
		createDataSource<any>("profiles", "/profiles", config),

	// 钱包
	wallet: (config?: Partial<DataSourceConfig>) =>
		createDataSource<any>("wallet", "/wallet", config),

	// 对话列表
	dialogues: (config?: Partial<DataSourceConfig>) =>
		createDataSource<any>("dialogues", "/dialogues", config),

	// 聊天记录
	conversations: (config?: Partial<DataSourceConfig>) =>
		createDataSource<any>("conversations", "/conversations", config),

	// 朋友圈
	feeds: (config?: Partial<DataSourceConfig>) => createDataSource<any>("feeds", "/feeds", config),

	// 交易记录
	transactions: (config?: Partial<DataSourceConfig>) =>
		createDataSource<any>("transactions", "/transactions", config),

	// 资源文件
	assets: (config?: Partial<DataSourceConfig>) =>
		createDataSource<any>("assets", "/assets", config),
};

export default dataSources;
