import {
  FaBars,
  FaArrowRotateLeft,
  FaArrowRotateRight,
  FaRegCopy,
  FaRegPaste,
} from "react-icons/fa6";
import { uiConfigStore, operationsStore } from "../lib/store";
import { IconButton } from "./IconButton";
import { useClipboard } from "@mantine/hooks";
import { IOperation } from "../lib/types";
import { updateOperations } from "../lib/update";
import { isValidOperation, jsonParseReviver } from "../lib/utils";

export function Header({
  currentOperation,
}: {
  currentOperation?: IOperation;
}) {
  const setUiConfig = uiConfigStore().setUiConfig;
  const { undo, redo, pastStates, futureStates } =
    operationsStore.temporal.getState();
  const { operations, setOperation } = operationsStore();
  const clipboard = useClipboard();

  return (
    <div className="border-b p-2 flex items-center justify-between gap-4">
      <IconButton
        icon={FaBars}
        size={20}
        onClick={() => setUiConfig((p) => ({ hideSidebar: !p.hideSidebar }))}
      />
      <h1 style={{ marginRight: "auto" }}>Visual Logic</h1>
      <div className="flex items-center gap-2">
        <IconButton
          title="Copy"
          icon={FaRegCopy}
          size={20}
          onClick={() => clipboard.copy(JSON.stringify(currentOperation))}
          disabled={!currentOperation}
          className={!currentOperation ? "cursor-not-allowed" : ""}
        />
        <IconButton
          title="Paste"
          icon={FaRegPaste}
          size={20}
          onClick={async () => {
            try {
              const copied = await navigator.clipboard.readText();
              const parsedOperation = JSON.parse(copied, jsonParseReviver);
              if (!isValidOperation(parsedOperation)) {
                throw new Error("Invalid operation pasted");
              }
              setOperation(
                updateOperations(operations, {
                  ...parsedOperation,
                  id: currentOperation?.id,
                  name: currentOperation?.name,
                })
              );
            } catch (error) {
              console.error(error);
            }
          }}
          disabled={!currentOperation}
          className={!currentOperation ? "cursor-not-allowed" : ""}
        />
        <IconButton
          title="Undo"
          icon={FaArrowRotateLeft}
          size={20}
          onClick={() => undo()}
          disabled={!pastStates.length}
          className={!pastStates.length ? "cursor-not-allowed" : ""}
        />
        <IconButton
          title="Redo"
          icon={FaArrowRotateRight}
          size={20}
          onClick={() => redo()}
          disabled={!futureStates.length}
          className={!futureStates.length ? "cursor-not-allowed" : ""}
        />
      </div>
    </div>
  );
}
