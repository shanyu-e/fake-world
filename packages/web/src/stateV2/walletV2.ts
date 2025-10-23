import { dataSources } from "@/data/DataSourceFactory";
import { createDataSourceAtom } from "./atomWithDataSource";
import { mainStore } from "./store";

export type TStateWallet = {
	/** 零钱余额 */
	balance: string;
	/** 零钱通 */
	miniFund: string;
	/** 零钱通收益率，单位 % */
	miniFundYield: string;
};

// 创建钱包数据源
const walletDataSource = dataSources.wallet();

// 创建支持数据源的钱包atom
const walletAtomConfig = createDataSourceAtom<TStateWallet>(
	"wallet",
	{
		balance: "520.00",
		miniFund: "1314.00",
		miniFundYield: "2.75",
	},
	walletDataSource,
	{
		syncOnMount: true,
		syncInterval: 30000, // 30秒同步一次
	},
);

export const walletAtom = walletAtomConfig.atom;
export const walletLoadingAtom = walletAtomConfig.loadingAtom;
export const walletErrorAtom = walletAtomConfig.errorAtom;
export const walletLoadAtom = walletAtomConfig.loadAtom;
export const walletCreateAtom = walletAtomConfig.createAtom;
export const walletDeleteAtom = walletAtomConfig.deleteAtom;

// 兼容性函数
export const getWalletVauleSnapshot = () => mainStore.get(walletAtom);

// 新的钱包操作函数
export const updateWallet = (data: Partial<TStateWallet>) => {
	mainStore.set(walletAtom, data);
};

export const loadWallet = () => {
	mainStore.set(walletLoadAtom);
};
