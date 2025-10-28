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
// 创建支持数据源的钱包atom（单个钱包）
const walletAtomConfig = createDataSourceAtom<TStateWallet>(
  "wallet",
  {
    balance: "520.00",
    miniFund: "1314.00",
    miniFundYield: "2.75",
  },
  (get) => dataSources.wallet(get),
  {
    syncOnMount: true,
    syncInterval: 30000, // 30秒同步一次
  }
);

export const walletAtom = walletAtomConfig.atom;
export const walletLoadingAtom = walletAtomConfig.loadingAtom;
export const walletErrorAtom = walletAtomConfig.errorAtom;
export const walletLoadAtom = walletAtomConfig.loadAtom;
export const walletCreateAtom = walletAtomConfig.createAtom;
export const walletDeleteAtom = walletAtomConfig.deleteAtom;

// 创建支持数据源的所有钱包atom（钱包列表）
const allWalletsAtomConfig = createDataSourceAtom<TStateWallet[]>("allWallets", [], (get) => dataSources.allWallets(get), {
  syncOnMount: false, // 不自动加载
  syncInterval: 30000,
});

export const allWalletsAtom = allWalletsAtomConfig.atom;
export const allWalletsLoadingAtom = allWalletsAtomConfig.loadingAtom;
export const allWalletsErrorAtom = allWalletsAtomConfig.errorAtom;
export const allWalletsLoadAtom = allWalletsAtomConfig.loadAtom;
export const allWalletsCreateAtom = allWalletsAtomConfig.createAtom;
export const allWalletsDeleteAtom = allWalletsAtomConfig.deleteAtom;

// 兼容性函数
export const getWalletVauleSnapshot = () => mainStore.get(walletAtom);

// 新的钱包操作函数
export const updateWallet = (data: Partial<TStateWallet>) => {
  mainStore.set(walletAtom, data);
};

export const loadWallet = async () => {
  return await mainStore.set(walletLoadAtom);
};

// 加载所有钱包数据
export const loadAllWallets = async () => {
  return await mainStore.set(allWalletsLoadAtom);
};
