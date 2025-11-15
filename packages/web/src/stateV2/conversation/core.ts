import dataSources from "@/data/DataSourceFactory";
import { dequal } from "dequal/lite";
import type { SetStateAction } from "jotai";
import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { Descendant } from "slate";
import { createDataSourceAtom } from "../atomWithDataSource";
import { dataSourceConfigAtom } from "../dataSourceConfig";
import type { IStateProfile } from "../profile";
import { mainStore } from "../store";
import type { TConversationItem } from "./typing";
import { EConversationType } from "./typing";

export type TStateConversationList = TConversationItem[];

// 所有会话列表的存储结构：Record<friendId, TStateConversationList>
export type TAllConversationLists = Record<IStateProfile["id"], TStateConversationList>;

export const allConversationListAtomConfig = createDataSourceAtom<TAllConversationLists>(
	"allConversations",
	{} as TAllConversationLists,
	(get) => dataSources.conversationItems(get),
	{
		syncOnMount: true,
		syncInterval: 30000, // 30秒同步一次
	},
);

const allConversationListAtom = allConversationListAtomConfig.atom;
// const allConversationListLoadingAtom = allConversationListAtomConfig.loadingAtom;
// const allConversationListErrorAtom = allConversationListAtomConfig.errorAtom;
// const allConversationListCreateAtom = allConversationListAtomConfig.createAtom;
// const allConversationListDeleteAtom = allConversationListAtomConfig.deleteAtom;

// 为每个 friendId 创建独立的 atom，优先从 allConversationListAtom 读取，如果没有则从本地存储读取
export const conversationListAtom = atomFamily((id: IStateProfile["id"]) => {
	// 本地存储的 atom（作为后备）

	// 合并 atom：优先使用远程数据，如果远程数据中不存在该 friendId，则使用本地存储
	return atom(
		(get) => {
			const allConversations = get(allConversationListAtom);
			const remoteData = allConversations?.[id];
			// 如果远程数据存在且是数组，则使用远程数据
			if (Array.isArray(remoteData)) {
				return remoteData;
			}
		},
		(get, set, update: SetStateAction<TStateConversationList>) => {
			const allConversations = get(allConversationListAtom);
			const currentValue = allConversations?.[id];
			const newValue =
				typeof update === "function"
					? (update as (prev: TStateConversationList) => TStateConversationList)(currentValue)
					: update;

			// 更新远程 atom（更新整个对象）
			set(allConversationListAtom, {
				...allConversations,
				[id]: newValue,
			});
		},
	);
}, dequal);

export const getConversationListValueSnapshot = (id: IStateProfile["id"]) =>
	mainStore.get(conversationListAtom(id));

export const setConversationListValue = (
	id: IStateProfile["id"],
	params: SetStateAction<TStateConversationList>,
) => mainStore.set(conversationListAtom(id), params);

export const loadAllConversations = async () => {
	// 自定义加载：拉取远程数据，转换为内部结构并按 dialogueId 分组
	const getConfig = () => mainStore.get(dataSourceConfigAtom);
	const ds = dataSources.conversationItems(getConfig);
	const rawList = await ds.getAll();

	// 兼容远程返回的单条会话结构，转换为内部 TConversationItem 并按 dialogueId 分组
	const grouped: TAllConversationLists = {} as TAllConversationLists;

	(rawList as any[]).forEach((raw) => {
		const id = raw.id as string;
		if (!grouped[id]) grouped[id] = [];

		// 基础字段映射
		const base = {
			id: String(raw.id),
			dialogueId: String(raw.dialogueId),
			role: raw.role,
			upperText: raw.upperText ?? undefined,
			sendTimestamp: raw.sendTimestamp ?? undefined,
		} as any;

		// 类型映射（目前主要兼容 text）
		// 注意：由于 RemoteDataSource 已经将 API 响应转换为驼峰格式，这里直接使用驼峰字段名
		if (raw.type === "text") {
			const textContent = Array.isArray(raw.textContent)
				? (raw.textContent as Descendant[])
				: ([raw.textContent] as Descendant[]);
			grouped[id].push({
				...base,
				type: EConversationType.text,
				textContent,
				referenceId: raw.referenceId ?? undefined,
			});
		} else {
			// 其他类型做最小兼容：保留 type，透传 content 到相应字段可按需拓展
			grouped[id].push({
				...base,
				type: raw.type,
				// 尝试映射常见字段；实际可根据后端返回类型细化
				imageInfo: raw.imageInfo,
				videoInfo: raw.videoInfo,
				duration: raw.duration,
				stt: raw.stt,
				showStt: raw.showStt,
				amount: raw.amount,
				originalSender: raw.originalSender,
				redPacketStatus: raw.redPacketStatus,
				avatarInfo: raw.avatarInfo,
				nickname: raw.nickname,
			} as any);
		}
		mainStore.set(conversationListAtom(id), grouped[id]);
	});

	// mainStore.set(allConversationListAtom, grouped);
};

export const conversationItemReferenceAtom = atomFamily(
	(params: { friendId: IStateProfile["id"]; conversationId: TConversationItem["id"] }) =>
		conversationListAtom(params.conversationId),
	dequal,
);
