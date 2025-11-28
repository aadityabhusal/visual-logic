import {
  getOperationEntities,
  handleNavigation,
  NavigationDirection,
  NavigationModifier,
} from "@/lib/navigation";
import { operationsStore, uiConfigStore } from "@/lib/store";
import { HotkeyItem } from "@mantine/hooks";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

export function useCustomHotkeys(): HotkeyItem[] {
  const { undo, redo } = operationsStore.temporal.getState();
  const [searchParams] = useSearchParams();
  const { operations } = operationsStore();
  const currentOperation = useMemo(
    () => operations.find((op) => op.id === searchParams.get("operationId")),
    [operations, searchParams]
  );
  const { navigation, setUiConfig } = uiConfigStore();
  const entities = useMemo(
    () => currentOperation && getOperationEntities(currentOperation),
    [currentOperation]
  );

  const hotKeys: {
    key: string;
    direction: NavigationDirection;
    modifier?: NavigationModifier;
  }[] = [
    { key: "ArrowLeft", direction: "left" },
    { key: "ArrowLeft", direction: "left", modifier: "mod" },
    { key: "ArrowLeft", direction: "left", modifier: "alt" },
    { key: "ArrowRight", direction: "right" },
    { key: "ArrowRight", direction: "right", modifier: "mod" },
    { key: "ArrowRight", direction: "right", modifier: "alt" },
    { key: "ArrowUp", direction: "up" },
    { key: "ArrowUp", direction: "up", modifier: "mod" },
    { key: "ArrowUp", direction: "up", modifier: "alt" },
    { key: "ArrowDown", direction: "down" },
    { key: "ArrowDown", direction: "down", modifier: "mod" },
    { key: "ArrowDown", direction: "down", modifier: "alt" },
  ];

  return [
    ["meta+shift+z", () => redo()],
    ["meta+z", () => undo()],
    ["meta+y", () => redo()],
    ...(entities
      ? (hotKeys.map(({ modifier, direction, key }) => [
          (modifier ? `${modifier}+` : "") + key,
          (event) => {
            handleNavigation({
              event,
              direction,
              navigation,
              setUiConfig,
              modifier,
              entities,
            });
          },
          { preventDefault: modifier === "mod" ? true : false },
        ]) as HotkeyItem[])
      : []),
  ];
}
