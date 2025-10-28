import { dataSources } from "@/data/DataSourceFactory";
import { INIT_FRIENDS, INIT_MY_PROFILE, MYSELF_ID } from "@/faker/wechat/user";
import { dequal } from "dequal/lite";
import { type SetStateAction, atom } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomFamily, selectAtom } from "jotai/utils";
import type { OpticFor_ } from "optics-ts";
import { createDataSourceAtom } from "./atomWithDataSource";
import { dataSourceConfigAtom } from "./dataSourceConfig";
import { debounceGenerateNameAnchorGroup, type generateNameAnchorGroup } from "./profile/helpers";
import type { IStateProfile, TStateAllProfiles, TStateFriendsTotalCountDisplayConfig } from "./profile/typing";
import { mainStore } from "./store";

// 创建支持数据源的用户档案atom
const allProfilesAtomConfig = createDataSourceAtom<TStateAllProfiles>(
  "allProfiles",
  [INIT_MY_PROFILE, ...INIT_FRIENDS],
  (get) => dataSources.profiles(get),
  {
    syncOnMount: true,
    syncInterval: 30000, // 30秒同步一次
  }
);

export const allProfilesAtom = allProfilesAtomConfig.atom;
export const allProfilesLoadingAtom = allProfilesAtomConfig.loadingAtom;
export const allProfilesErrorAtom = allProfilesAtomConfig.errorAtom;
export const allProfilesLoadAtom = allProfilesAtomConfig.loadAtom;
export const allProfilesCreateAtom = allProfilesAtomConfig.createAtom;
export const allProfilesDeleteAtom = allProfilesAtomConfig.deleteAtom;

const allProfilesDEqualCompareAtom = selectAtom(allProfilesAtom, (v) => v, dequal);

export const getAllProfilesValueSnapshot = () => mainStore.get(allProfilesAtom);
export const setAllProfilesValue = (args: SetStateAction<TStateAllProfiles>) => mainStore.set(allProfilesAtom, args);

/**
 * 所有人的信息 id
 */
export const allProfilesIdsAtom = atom((get) => get(allProfilesDEqualCompareAtom).map((v) => v.id));

export const getAllProfilesIdsValueSnapshot = () => mainStore.get(allProfilesIdsAtom);

/**
 * 信息总数
 */
export const allProfilesTotalCountAtom = atom((get) => get(allProfilesDEqualCompareAtom).length);

export const getAllProfilesTotalCountValueSnapshot = () => mainStore.get(allProfilesTotalCountAtom);

/**
 * 单个用户信息
 */
export const profileAtom = atomFamily(
  (id: IStateProfile["id"]) => focusAtom(allProfilesAtom, (optic: OpticFor_<TStateAllProfiles>) => optic.find((v) => v.id === id)),
  dequal
);

export const getProfileValueSnapshot = (id: IStateProfile["id"]) => mainStore.get(profileAtom(id));
export const setProfileValue = (id: IStateProfile["id"], args: SetStateAction<IStateProfile>) => mainStore.set(profileAtom(id), args);

/**
 * 我的个人信息
 */
export const myProfileAtom = focusAtom(allProfilesAtom, (optic) => optic.find((v) => v.id === MYSELF_ID));

export const getMyProfileValueSnapshot = () => mainStore.get(myProfileAtom);

/**
 * 用于通讯录界面的锚点数据
 */
export const allProfilesAnchorDataAtom = atom<Promise<ReturnType<typeof generateNameAnchorGroup>>>((get) => {
  const payload = get(allProfilesDEqualCompareAtom).map((v) => ({
    id: v.id,
    name: v.remark ?? v.nickname,
    description: v.description,
    isStarred: v.isStarred,
    avatarInfo: v.avatarInfo,
  }));
  return new Promise((resolve) => {
    debounceGenerateNameAnchorGroup(payload, resolve);
  });
});

/**
 * 好友总数显示配置 - 这个保持本地存储
 */
export const friendsTotalCountDisplayConfigAtom = atom<TStateFriendsTotalCountDisplayConfig>({
  calcuateType: "auto",
  count: 4,
});

export const getFriendsTotalCountDisplayConfigValueSnapshot = () => mainStore.get(friendsTotalCountDisplayConfigAtom);

export const setFriendsTotalCountDisplayConfigValue = (args: SetStateAction<TStateFriendsTotalCountDisplayConfig>) =>
  mainStore.set(friendsTotalCountDisplayConfigAtom, args);

export const friendsTotalCountAtom = atom<number>((get) => {
  const { calcuateType, count } = get(friendsTotalCountDisplayConfigAtom);
  if (calcuateType === "static") {
    return count ?? 0;
  }
  return get(allProfilesTotalCountAtom) - 1;
});

export const getFriendsTotalCountValueSnapshot = () => mainStore.get(friendsTotalCountAtom);

// 新的用户档案操作函数
export const loadAllProfiles = async () => {
  return await mainStore.set(allProfilesLoadAtom);
};

export const createProfile = async (profile: Omit<IStateProfile, "id">) => {
  try {
    // 创建一个临时的 getter 函数来获取配置
    const getConfig = () => mainStore.get(dataSourceConfigAtom);
    const dataSource = dataSources.profiles(getConfig);

    // 创建用户档案
    const newProfile = (await dataSource.create(profile)) as IStateProfile;

    // 更新本地状态：添加到列表的开头
    await mainStore.set(allProfilesLoadAtom);

    return newProfile;
  } catch (error) {
    console.error("Failed to create profile:", error);
    throw error;
  }
};

export const updateProfile = (id: IStateProfile["id"], data: Partial<IStateProfile>) => {
  const currentProfile = mainStore.get(profileAtom(id));
  if (currentProfile) {
    mainStore.set(profileAtom(id), { ...currentProfile, ...data });
  }
};

export const deleteProfile = (id: IStateProfile["id"]) => {
  mainStore.set(allProfilesDeleteAtom, id);
};
