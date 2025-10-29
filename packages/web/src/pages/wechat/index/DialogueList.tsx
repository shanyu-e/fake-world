import { canBeDetected } from "@/components/NodeDetected";
import useMode from "@/components/useMode";
import { EMetaDataType, allNodesTreeAtom } from "@/stateV2/detectedNode";
import { dialogueListAtom, dialogueListEffect, dialogueListLoadAtom } from "@/stateV2/dialogueList";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { ReactSortable } from "react-sortablejs";
import DialogueItem from "./DialogueItem";

const DialogueList = () => {
  const { isEdit } = useMode();
  const [dialogueList, setDialogueList] = useAtom(dialogueListAtom);
  const [_, dialogueLoadList] = useAtom(dialogueListLoadAtom);
  const rebuildTree = useSetAtom(allNodesTreeAtom);
  useAtom(dialogueListEffect);

  const mappedSortableListData = useMemo(() => {
    return dialogueList.map((item) => ({
      id: item.id,
    }));
  }, [dialogueList]);

  useEffect(() => {
    dialogueLoadList();
  }, []);

  return (
    <canBeDetected.section
      metaData={{
        type: EMetaDataType.DialogueList,
        treeItemDisplayName: "对话列表",
        label: "从好友列表快速新建对话项",
      }}
      className="flex-1"
    >
      <ReactSortable
        disabled={!isEdit}
        list={mappedSortableListData}
        animation={400}
        setList={(v, sortable) => {
          if (isEdit && sortable) {
            const needUpdate = v.some((_, i) => v[i].id !== dialogueList[i].id);
            if (needUpdate) {
              setDialogueList(
                v.map((i) => {
                  return dialogueList.find((d) => d.id === i.id)!;
                })
              );
            }
          }
        }}
        onSort={() => {
          rebuildTree();
        }}
      >
        {dialogueList.map((item) => (
          <DialogueItem itemId={item.id} key={item.id} className={isEdit ? "cursor-grab" : ""} />
        ))}
      </ReactSortable>
    </canBeDetected.section>
  );
};

export default DialogueList;
