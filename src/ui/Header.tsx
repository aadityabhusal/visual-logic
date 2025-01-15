import { FaBars, FaArrowRotateLeft, FaArrowRotateRight } from "react-icons/fa6";
import { uiConfigStore, useStore } from "../lib/store";
import { IconButton } from "./IconButton";

export function Header() {
  const { setUiConfig, ...uiConfig } = uiConfigStore();
  const { undo, redo, pastStates, futureStates } = useStore.temporal.getState();

  return (
    <div className="border-b p-2 flex items-center justify-between gap-4">
      <IconButton
        icon={FaBars}
        size={20}
        onClick={() => setUiConfig({ hideSidebar: !uiConfig.hideSidebar })}
      />
      <h1 style={{ marginRight: "auto" }}>Visual Logic</h1>
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
