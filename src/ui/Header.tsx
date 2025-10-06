import {
  FaBars,
  FaArrowRotateLeft,
  FaArrowRotateRight,
  FaRegCopy,
  FaRegPaste,
  FaCheck,
} from "react-icons/fa6";
import { uiConfigStore, operationsStore } from "../lib/store";
import { IconButton } from "./IconButton";
import { useClipboard, useTimeout } from "@mantine/hooks";
import { IOperation } from "../lib/types";
import { updateOperations } from "../lib/update";
import { jsonParseReviver } from "../lib/utils";
import { useState } from "react";
import { IOperationSchema } from "../lib/schemas";

export function Header({
  currentOperation,
}: {
  currentOperation?: IOperation;
}) {
  const setUiConfig = uiConfigStore().setUiConfig;
  const { undo, redo, pastStates, futureStates } =
    operationsStore.temporal.getState();
  const { operations, setOperation } = operationsStore();
  const clipboard = useClipboard({ timeout: 500 });
  const [isOperationPasted, setIsOperationPasted] = useState(false);
  const pasteAnimation = useTimeout(() => setIsOperationPasted(false), 500);

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
          icon={clipboard.copied ? FaCheck : FaRegCopy}
          size={20}
          onClick={() => clipboard.copy(JSON.stringify(currentOperation))}
          disabled={!currentOperation}
          className={!currentOperation ? "cursor-not-allowed" : ""}
        />
        <IconButton
          title="Paste"
          icon={isOperationPasted ? FaCheck : FaRegPaste}
          size={20}
          onClick={async () => {
            try {
              const copied = await navigator.clipboard.readText();
              const parsedOperation = JSON.parse(copied, jsonParseReviver);
              const validatedOperation =
                IOperationSchema.safeParse(parsedOperation);
              if (validatedOperation.error) {
                throw new Error(validatedOperation.error.message);
              }
              setOperation(
                updateOperations(operations, {
                  ...parsedOperation,
                  id: currentOperation?.id,
                  name: currentOperation?.name,
                })
              );
              setIsOperationPasted(true);
              pasteAnimation.start();
            } catch (error) {
              console.error(error);
              pasteAnimation.clear();
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
