import { Combobox, useCombobox } from "@mantine/core";
import { ComponentPropsWithRef, ReactNode, useEffect, useState } from "react";
import { BaseInput } from "./Input/BaseInput";
import { IconButton } from "../ui/IconButton";
import { FaCirclePlus, FaCircleXmark } from "react-icons/fa6";
import { dropDownStore } from "../lib/store";
import { getHotkeyHandler } from "@mantine/hooks";
import { IDropdownItem } from "../lib/types";

export function Dropdown<T extends "button" | "input" = "button">({
  id,
  value,
  items,
  handleDelete,
  addMethod,
  children,
  options,
  target,
}: {
  id?: string;
  value?: string;
  items?: IDropdownItem[];
  handleDelete?: () => void;
  addMethod?: () => void;
  children?: ReactNode;
  options?: { withSearch?: boolean };
  target: (value: ComponentPropsWithRef<T>) => ReactNode;
}) {
  const { focusedEntityId, setDropdown } = dropDownStore((s) => ({
    focusedEntityId: s.focusedEntityId,
    setDropdown: s.setDropdown,
  }));
  const isFocused = id && focusedEntityId === id;
  const [search, setSearch] = useState("");
  const combobox = useCombobox({
    loop: true,
    onDropdownClose: () => {
      handleSearch(value || "");
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => combobox.focusSearchInput(),
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
        className={`data-[combobox-selected]:bg-dropdown-hover data-[combobox-active]:bg-dropdown-selected hover:bg-dropdown-hover`}
        active={option.value === value}
        onClick={option.onClick}
      >
        {option.label || option.value}
      </Combobox.Option>
    ));

  useEffect(() => {
    if (value) setSearch(value);
  }, [value]);

  useEffect(() => {
    combobox.selectFirstOption();
  }, [search]);

  function handleSearch(value: string) {
    setSearch(value);
  }

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        items?.find((i) => i.value === optionValue)?.onClick?.();
        combobox.closeDropdown();
        handleSearch("");
      }}
      store={combobox}
      keepMounted={false}
      offset={{ mainAxis: 0, alignmentAxis: -1 }}
      position="bottom-start"
    >
      <Combobox.DropdownTarget>
        <div
          className={
            "flex items-start relative" +
            (isFocused ? " outline outline-1 outline-border" : "")
          }
          onMouseOver={(e) => {
            e.stopPropagation();
            setDropdown({ focusedEntityId: id });
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            !combobox?.dropdownOpened &&
              setDropdown({ focusedEntityId: undefined });
          }}
        >
          <Combobox.EventsTarget>
            {target({
              value: search,
              onChange: (val: string) => handleSearch(val),
              onKeyDown: getHotkeyHandler([
                ["ctrl+space", () => combobox.openDropdown()],
              ]),
              onClick: () => combobox?.openDropdown(),
              onFocus: () => setDropdown({ focusedEntityId: id }),
            } as ComponentPropsWithRef<T>)}
          </Combobox.EventsTarget>
          {handleDelete && (
            <IconButton
              tabIndex={-1}
              className="absolute -top-1.5 -right-1 text-border bg-white rounded-full z-10"
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
              className="absolute top-1.5 -right-2.5 text-border bg-white rounded-full z-10"
              icon={FaCirclePlus}
              onClick={() => {
                combobox?.closeDropdown();
                addMethod();
              }}
              hidden={!isFocused}
            />
          )}
          {children}
        </div>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown
        classNames={{
          dropdown: "absolute min-w-max bg-editor border border-border",
        }}
      >
        {options?.withSearch ? (
          <Combobox.Search
            component={BaseInput}
            value={search}
            onChange={(value) => handleSearch(value as unknown as string)}
            placeholder="Search..."
            className="!w-16"
          />
        ) : null}
        {dropdownOptions?.length === 0 ? (
          <Combobox.Empty>Not found</Combobox.Empty>
        ) : (
          <Combobox.Options className="overflow-y-auto max-h-32 dropdown-scrollbar">
            {dropdownOptions}
          </Combobox.Options>
        )}
      </Combobox.Dropdown>
    </Combobox>
  );
}
