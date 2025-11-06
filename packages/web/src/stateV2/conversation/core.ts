import { dequal } from "dequal/lite";
import type { SetStateAction } from "jotai";
import { focusAtom } from "jotai-optics";
import { atomFamily } from "jotai/utils";
import type { IStateProfile } from "../profile";
import { mainStore } from "../store";
import { MOCK_INIT_CONVERSATION_LIST } from "./consts";
import type { TConversationItem } from "./typing";
import { createDataSourceAtom } from "../atomWithDataSource";
import dataSources from "@/data/DataSourceFactory";
import type { OpticFor_ } from "optics-ts";

export type TStateConversationList = TConversationItem[];

export const allConversationListAtomConfig = createDataSourceAtom<TStateConversationList>(
  "conversation",
  MOCK_INIT_CONVERSATION_LIST,
  (get) => dataSources.conversations(get),
  {
    syncOnMount: true,
    syncInterval: 30000, // 30秒同步一次
  }
);

const allConversationListAtom = allConversationListAtomConfig.atom;
// const allConversationListLoadingAtom = allConversationListAtomConfig.loadingAtom;
// const allConversationListErrorAtom = allConversationListAtomConfig.errorAtom;
// const allConversationListLoadAtom = allConversationListAtomConfig.loadAtom;
// const allConversationListCreateAtom = allConversationListAtomConfig.createAtom;
// const allConversationListDeleteAtom = allConversationListAtomConfig.deleteAtom;

// export const conversationListAtom = atomFamily((id: IStateProfile["id"]) => {
//   return atomWithStorage<TStateConversationList>(`conversationList-${id}`, MOCK_INIT_CONVERSATION_LIST);
// });
// export const conversationListAtom = atomFamily((_id: IStateProfile["id"]) => allConversationListAtom, dequal);
export const conversationListAtom = atomFamily(
  (id: IStateProfile["id"]) => focusAtom(allConversationListAtom, (optic: OpticFor_<TStateConversationList>) => optic.find((v) => v.id === id)),
  dequal
);

export const getConversationListValueSnapshot = (id: IStateProfile["id"]) => mainStore.get(conversationListAtom(id));

export const setConversationListValue = (id: IStateProfile["id"], params: SetStateAction<TConversationItem>) =>
  mainStore.set(conversationListAtom(id), params);

export const conversationItemReferenceAtom = atomFamily(
  (params: { friendId: IStateProfile["id"]; conversationId: TConversationItem["id"] }) => conversationListAtom(params.conversationId),
  dequal
);
