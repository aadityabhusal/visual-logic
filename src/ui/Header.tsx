import { FaBars, FaArrowRotateLeft, FaArrowRotateRight } from "react-icons/fa6";
import { uiConfigStore, operationsStore } from "../lib/store";
import { IconButton } from "./IconButton";

export function Header() {
  const setUiConfig = uiConfigStore().setUiConfig;
  const { undo, redo, pastStates, futureStates } =
    operationsStore.temporal.getState();

  return (
    <div className="border-b p-2 flex items-center justify-between gap-4">
      <IconButton
        icon={FaBars}
        size={20}
        onClick={() => setUiConfig((p) => ({ hideSidebar: !p.hideSidebar }))}
      />
      <h1 style={{ marginRight: "auto" }}>Logic Flow</h1>
      <div className="flex items-center gap-2">
        <IconButton
          title="Undo"
          icon={FaArrowRotateLeft}
          size={20}
          onClick={() => undo()}
          disabled={!pastStates.length}
        />
        <IconButton
          title="Redo"
          icon={FaArrowRotateRight}
          size={20}
          onClick={() => redo()}
          disabled={!futureStates.length}
        />
      </div>
    </div>
  );
}
