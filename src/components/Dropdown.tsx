import { Combobox, useCombobox } from "@mantine/core";
import { HTMLAttributes, ReactNode, useEffect, useMemo, useState } from "react";
import { BaseInput } from "./Input/BaseInput";
import { IconButton } from "../ui/IconButton";
import {
  FaCircleChevronDown,
  FaCirclePlus,
  FaCircleXmark,
  FaSquareArrowUpRight,
} from "react-icons/fa6";
import { operationsStore, uiConfigStore } from "../lib/store";
import { getHotkeyHandler, HotkeyItem, useHotkeys } from "@mantine/hooks";
import { Context, IData, IDropdownItem, IStatement } from "../lib/types";
import { useSearchParams } from "react-router";
import { isDataOfType, isTextInput } from "../lib/utils";
import { getNextIdAfterDelete, getOperationEntities } from "@/lib/navigation";
import { useCustomHotkeys } from "@/hooks/useNavigation";

export interface IDropdownTargetProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange" | "defaultValue"> {
  value?: string;
  onChange?: (value: string) => void;
}

export function Dropdown({
  id,
  value,
  data,
  result,
  items,
  handleDelete,
  addOperationCall,
  children,
  options,
  hotkeys,
  isInputTarget,
  reference,
  target,
}: {
  id: string;
  value?: string;
  data?: IStatement["data"];
  result?: IStatement["data"];
  items?: IDropdownItem[];
  handleDelete?: () => void;
  addOperationCall?: () => void;
  children?: ReactNode;
  options?: {
    withSearch?: boolean;
    withDropdownIcon?: boolean;
    focusOnClick?: boolean;
  };
  hotkeys?: HotkeyItem[];
  isInputTarget?: boolean;
  reference?: IData["reference"];
  target: (value: IDropdownTargetProps) => ReactNode;
  context: Context;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { highlightOperation, navigation, setUiConfig } = uiConfigStore();
  const forceDisplayBorder =
    highlightOperation && isDataOfType(data, "operation");
  const [isHovered, setHovered] = useState(false);
  const isFocused = navigation?.id === id;
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    loop: true,
    onDropdownClose: () => {
      handleSearch(options?.withSearch ? "" : value || "");
      combobox.resetSelectedOption();
      setUiConfig((p) => ({ ...p, navigation: { id }, result }));
    },
    onDropdownOpen: () => {
      if (options?.withSearch) combobox.focusSearchInput();
      setUiConfig({
        navigation: { id, disable: true },
        result,
        showPopup: true,
      });
    },
  });
  const customHotKeys = useCustomHotkeys();

  const dropdownOptions = useMemo(
    () =>
      items
        ?.filter(
          (option) =>
            search === value ||
            option.label?.toLowerCase().includes(search.toLowerCase().trim()) ||
            option.value.toLowerCase().includes(search.toLowerCase().trim())
        )
        ?.map((option) => (
          <Combobox.Option
            value={option.value}
            key={option.value}
            className={`flex items-center justify-between gap-4 data-combobox-selected:bg-dropdown-hover data-combobox-active:bg-dropdown-selected hover:bg-dropdown-hover`}
            active={option.value === value}
          >
            <span className="text-sm max-w-32 truncate">
              {option.label || option.value}
            </span>
            <span className="text-xs">{option.secondaryLabel}</span>
          </Combobox.Option>
        )),
    [items, search, value]
  );

  function handleSearch(val: string) {
    if (!combobox.dropdownOpened) combobox.openDropdown();
    setSearch(val);
  }

  useHotkeys(
    isFocused
      ? [
          ...(["backspace", "alt+backspace"].map((key) => [
            key,
            () => {
              const textInput = isTextInput(combobox.targetRef.current);
              if ((textInput && textInput.value) || !handleDelete) return;
              handleDelete();
              textInput?.blur();
              setUiConfig((p) => {
                const operations = operationsStore.getState().operations;
                const operation = operations.find(
                  (op) => op.id === searchParams.get("operationId")
                );
                if (!operation) return p;
                const newEntities = getOperationEntities(operation);
                const oldEntities = p.navigationEntities || [];
                return {
                  navigationEntities: newEntities,
                  navigation: {
                    id: getNextIdAfterDelete(newEntities, oldEntities, id),
                  },
                };
              });
            },
            { preventDefault: isInputTarget ? !search : false },
          ]) as HotkeyItem[]),
          ...(["alt+=", "alt+≠"].map((key) => [
            key,
            () => addOperationCall?.(),
            { preventDefault: true },
          ]) as HotkeyItem[]),
        ]
      : [],
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (value) setSearch(options?.withSearch ? "" : value);
  }, [value, options?.withSearch]);

  useEffect(() => {
    combobox.selectFirstOption();
  }, [search]);

  useEffect(() => {
    if (combobox.dropdownOpened) combobox.selectActiveOption();
  }, [combobox.dropdownOpened]);

  useEffect(() => {
    if (isFocused && combobox.targetRef.current instanceof HTMLInputElement) {
      combobox.targetRef.current.focus();
    }

    const textInput = isTextInput(combobox.targetRef.current);
    if (isFocused && textInput && textInput !== document.activeElement) {
      let caretPosition = 0;
      if (
        (navigation.direction === "right" && navigation.modifier) ||
        (navigation.direction === "left" && !navigation.modifier)
      ) {
        caretPosition = textInput.value.length;
      }
      textInput.setSelectionRange(caretPosition, caretPosition);
    }
  }, [isFocused, combobox.targetRef, navigation]);

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        if (value !== optionValue) {
          items?.find((i) => i.value === optionValue)?.onClick?.();
          handleSearch("");
        }
        combobox.closeDropdown();
      }}
      store={combobox}
      keepMounted={false}
      offset={{ mainAxis: 0, alignmentAxis: -1 }}
      position="bottom-start"
    >
      <Combobox.DropdownTarget>
        <div
          className={[
            "flex items-start relative p-px",
            forceDisplayBorder || isFocused || isHovered
              ? "outline outline-border"
              : "",
          ].join(" ")}
          onMouseOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
        >
          <Combobox.EventsTarget
            withKeyboardNavigation={combobox.dropdownOpened}
          >
            {target({
              ...(isInputTarget
                ? {
                    value: search,
                    onChange: (val) => handleSearch(val),
                    onBlur: () => combobox?.closeDropdown(),
                    onKeyDown: getHotkeyHandler([
                      ["ctrl+space", () => combobox.openDropdown()],
                      ...customHotKeys,
                      ...(hotkeys ?? []),
                    ]),
                  }
                : {}),
              onClick: (e) => {
                e.stopPropagation();
                if (options?.focusOnClick && e.target !== e.currentTarget) {
                  return;
                }
                combobox?.openDropdown();
              },
              onFocus: () =>
                setUiConfig({ navigation: { id }, result, showPopup: true }),
            })}
          </Combobox.EventsTarget>
          {isDataOfType(data, "operation") && reference && (
            <IconButton
              tabIndex={-1}
              size={8}
              className="absolute -top-1.5 right-2.5 text-white bg-border rounded-full z-10 p-0.5"
              icon={FaSquareArrowUpRight}
              onClick={() => setSearchParams({ operationId: reference.id })}
              hidden={!isFocused && !isHovered}
              title="Go to reference"
            />
          )}
          {handleDelete && (
            <IconButton
              tabIndex={-1}
              size={12}
              className="absolute -top-1.5 -right-1 text-border bg-white rounded-full z-10"
              icon={FaCircleXmark}
              onClick={() => {
                combobox?.closeDropdown();
                handleDelete();
              }}
              hidden={!isFocused && !isHovered}
              title="Delete"
            />
          )}
          {addOperationCall && (
            <IconButton
              size={12}
              title="Add method"
              className="absolute top-1.5 -right-2 text-border bg-white rounded-full z-10"
              icon={FaCirclePlus}
              onClick={() => {
                combobox?.closeDropdown();
                addOperationCall();
              }}
              hidden={!isFocused && !isHovered}
            />
          )}
          {options?.withDropdownIcon && !!items?.length && (
            <IconButton
              size={12}
              className="absolute -bottom-1.5 -right-1 text-border bg-white rounded-full z-10"
              icon={FaCircleChevronDown}
              onClick={() => {
                combobox?.openDropdown();
              }}
              hidden={!isFocused && !isHovered}
            />
          )}
          {children}
        </div>
      </Combobox.DropdownTarget>
      {isFocused ? (
        <Combobox.Dropdown
          classNames={{
            dropdown:
              "absolute min-w-max" +
              (!!dropdownOptions?.length || options?.withSearch
                ? " bg-editor border"
                : ""),
          }}
        >
          {options?.withSearch ? (
            <Combobox.Search
              component={BaseInput}
              value={search}
              onChange={(value) => handleSearch(value as unknown as string)}
              placeholder="Search..."
              classNames={{ input: "min-w-full" }}
            />
          ) : null}
          {dropdownOptions?.length === 0 ? null : (
            <Combobox.Options className="overflow-y-auto max-h-32 dropdown-scrollbar">
              {dropdownOptions}
            </Combobox.Options>
          )}
        </Combobox.Dropdown>
      ) : null}
    </Combobox>
  );
}
