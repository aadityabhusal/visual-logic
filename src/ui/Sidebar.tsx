import { FaPlus, FaX } from "react-icons/fa6";
import { uiConfigStore, useStore } from "../lib/store";
import { updateOperations } from "../lib/update";
import { createOperation } from "../lib/utils";
import { Button } from "./Button";
import { NoteText } from "./NoteText";

export function Sidebar() {
  const { operations, addOperation, setOperation } = useStore();
  const { selectedOperationId, setUiConfig } = uiConfigStore((s) => ({
    selectedOperationId: s.selectedOperationId,
    setUiConfig: s.setUiConfig,
  }));

  if (!localStorage.getItem("operations")) {
    addOperation(createOperation({ name: "main" }));
  }
  return (
    <div className="flex flex-col ml-auto w-40">
      <div className="p-1">Operations</div>
      <div className="flex-1 border-y border-solid border-border p-1 overflow-y-auto dropdown-scrollbar">
        <ul className="list-none p-0 m-0">
          {!operations.length && <NoteText center>Add an operation</NoteText>}
          {operations.map((item) => (
            <li
              className={
                "flex items-center justify-between cursor-pointer p-1 hover:bg-dropdown-hover " +
                (item.id === selectedOperationId
                  ? "bg-dropdown-hover"
                  : "bg-editor")
              }
              key={item.id}
              onClick={() => setUiConfig({ selectedOperationId: item.id })}
            >
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                {item.name}
              </span>
              <FaX
                className="shrink-0"
                title="Delete operation"
                size={8}
                onClick={(e) => {
                  e.stopPropagation();
                  setOperation(updateOperations(operations, item, true));
                }}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="p-1 flex">
        <Button
          title="Add a new operation"
          onClick={() => addOperation(createOperation({ name: "" }))}
        >
          <FaPlus size={12} /> <span>Operation</span>
        </Button>
      </div>
    </div>
  );
}
