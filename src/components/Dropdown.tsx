import { Combobox, useCombobox } from "@mantine/core";
import { HTMLAttributes, ReactNode, useEffect, useState } from "react";
import { BaseInput } from "./Input/BaseInput";
import { IconButton } from "../ui/IconButton";
import {
  FaCircleChevronDown,
  FaCirclePlus,
  FaCircleXmark,
} from "react-icons/fa6";
import { dropDownStore, useStore } from "../lib/store";
import { getHotkeyHandler } from "@mantine/hooks";
import { IDropdownItem } from "../lib/types";

export function Dropdown({
  id,
  value,
  items,
  handleDelete,
  addMethod,
  children,
  options,
  isInputTarget,
  target,
}: {
  id?: string;
  value?: string;
  items?: IDropdownItem[];
  handleDelete?: () => void;
  addMethod?: () => void;
  children?: ReactNode;
  options?: { withSearch?: boolean; withDropdownIcon?: boolean };
  isInputTarget?: boolean;
  target: (
    value: Omit<HTMLAttributes<HTMLElement>, "onChange" | "defaultValue"> & {
      value: string;
      onChange?: (value: string) => void;
    }
  ) => ReactNode;
}) {
  const { undo, redo } = useStore.temporal.getState();
  const { focusedEntityId, setDropdown } = dropDownStore((s) => ({
    focusedEntityId: s.focusedEntityId,
    setDropdown: s.setDropdown,
  }));
  const isFocused = id && focusedEntityId === id;
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    loop: true,
    onDropdownClose: () => {
      handleSearch(options?.withSearch ? "" : value || "");
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => options?.withSearch && combobox.focusSearchInput(),
  });

  const dropdownOptions = items
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
        className={`flex items-center justify-between gap-4 data-[combobox-selected]:bg-dropdown-hover data-[combobox-active]:bg-dropdown-selected hover:bg-dropdown-hover`}
        active={option.value === value}
      >
        <span className="text-sm max-w-32 truncate">
          {option.label || option.value}
        </span>
        <span className="text-xs">{option.secondaryLabel}</span>
      </Combobox.Option>
    ));

  function handleSearch(val: string) {
    if (!combobox.dropdownOpened) combobox.openDropdown();
    setSearch(val);
  }

  useEffect(() => {
    if (value) setSearch(options?.withSearch ? "" : value);
  }, [value, options?.withSearch]);

  useEffect(() => {
    combobox.selectFirstOption();
  }, [search]);

  useEffect(() => {
    if (combobox.dropdownOpened) combobox.selectActiveOption();
  }, [combobox.dropdownOpened]);

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
          className={
            "flex items-start relative p-px" +
            (isFocused ? " outline outline-1 outline-border" : "")
          }
          onMouseOver={(e) => {
            e.stopPropagation();
            if (focusedEntityId !== id) setDropdown({ focusedEntityId: id });
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            setDropdown({ focusedEntityId: undefined });
          }}
        >
          <Combobox.EventsTarget>
            {target({
              value: search,
              ...(isInputTarget
                ? {
                    onChange: (val) => handleSearch(val),
                    onBlur: () => combobox?.closeDropdown(),
                    onKeyDown: getHotkeyHandler([
                      ["ctrl+space", () => combobox.openDropdown()],
                      ["meta+shift+z", () => redo()],
                      ["meta+z", () => undo()],
                      ["meta+y", () => redo()],
                    ]),
                  }
                : {}),
              onClick: () => combobox?.openDropdown(),
              onFocus: () => setDropdown({ focusedEntityId: id }),
            })}
          </Combobox.EventsTarget>
          {handleDelete && (
            <IconButton
              tabIndex={-1}
              className="absolute w-2.5 h-2.5 -top-1.5 -right-1 text-border bg-white rounded-full z-10"
              icon={FaCircleXmark}
              onClick={() => {
                combobox?.closeDropdown();
                handleDelete();
              }}
              hidden={!isFocused}
            />
          )}
          {addMethod && (
            <IconButton
              className="absolute w-2.5 h-2.5 top-[0.3125rem] -right-2 text-border bg-white rounded-full z-10"
              icon={FaCirclePlus}
              onClick={() => {
                combobox?.closeDropdown();
                addMethod();
              }}
              hidden={!isFocused}
            />
          )}
          {options?.withDropdownIcon && !!items?.length && (
            <IconButton
              className="absolute w-2.5 h-2.5 -bottom-1.5 -right-1 text-border bg-white rounded-full z-10"
              icon={FaCircleChevronDown}
              onClick={() => combobox?.openDropdown()}
              hidden={!isFocused}
            />
          )}
          {children}
        </div>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown
        classNames={{
          dropdown:
            "absolute min-w-max" +
            (!!dropdownOptions?.length || options?.withSearch
              ? " bg-editor border border-border"
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
    </Combobox>
  );
}
