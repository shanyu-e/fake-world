import { useEffect, useState } from "react";

export type DataSourceMode = "local" | "remote" | "hybrid";

interface DataSourceConfig {
	mode: DataSourceMode;
	apiBaseUrl: string;
	syncInterval: number;
	offlineMode: boolean;
	syncOnRead: boolean;
	syncOnWrite: boolean;
}

const defaultConfig: DataSourceConfig = {
	mode: "remote",
	apiBaseUrl: import.meta.env.VITE_API_URL || "http://100.64.0.3:9000",
	syncInterval: 30000,
	offlineMode: false,
	syncOnRead: true,
	syncOnWrite: true,
};

const STORAGE_KEY = "dataSourceConfig";

export const useDataSourceConfig = () => {
	const [config, setConfig] = useState<DataSourceConfig>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				return { ...defaultConfig, ...JSON.parse(stored) };
			}
		} catch (error) {
			console.error("Failed to load data source config:", error);
		}
		return defaultConfig;
	});

	const updateConfig = (newConfig: Partial<DataSourceConfig>) => {
		const updatedConfig = { ...config, ...newConfig };
		setConfig(updatedConfig);

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
		} catch (error) {
			console.error("Failed to save data source config:", error);
		}
	};

	const setMode = (mode: DataSourceMode) => {
		updateConfig({ mode });
	};

	const setOfflineMode = (offlineMode: boolean) => {
		updateConfig({ offlineMode });
	};

	const setSyncInterval = (syncInterval: number) => {
		updateConfig({ syncInterval });
	};

	const setSyncOnRead = (syncOnRead: boolean) => {
		updateConfig({ syncOnRead });
	};

	const setSyncOnWrite = (syncOnWrite: boolean) => {
		updateConfig({ syncOnWrite });
	};

	// 监听环境变量变化
	useEffect(() => {
		const envMode = import.meta.env.VITE_DATA_SOURCE_MODE as DataSourceMode;
		if (envMode && envMode !== config.mode) {
			setMode(envMode);
		}
	}, []);

	return {
		config,
		updateConfig,
		setMode,
		setOfflineMode,
		setSyncInterval,
		setSyncOnRead,
		setSyncOnWrite,
	};
};
