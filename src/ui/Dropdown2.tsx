import { Combobox, useCombobox } from "@mantine/core";
import { ReactNode, useEffect, useState } from "react";
import { BaseInput } from "./BaseInput";
import { IconButton } from "./IconButton";
import { FaCirclePlus, FaCircleXmark } from "react-icons/fa6";
import { dropDownStore } from "../lib/store";
import { getHotkeyHandler } from "@mantine/hooks";
import { theme } from "../lib/theme";

export function Dropdown2({
  id,
  value,
  items,
  onSelect,
  handleDelete,
  addMethod,
  children,
}: {
  id?: string;
  value?: string;
  items?: { label?: string; value: string; color?: keyof typeof theme.color }[];
  onSelect?: (value: string) => void;
  handleDelete?: () => void;
  addMethod?: () => void;
  children?: ReactNode;
}) {
  const { focusedEntityId, setDropdown } = dropDownStore((s) => ({
    focusedEntityId: s.focusedEntityId,
    setDropdown: s.setDropdown,
  }));
  const isFocused = focusedEntityId === id;
  const [search, setSearch] = useState(value || "");
  const combobox = useCombobox({
    loop: true,
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const filteredOptions = items?.filter((method) =>
    method.value.toLowerCase().includes(search.toLowerCase().trim())
  );

  const options = filteredOptions?.map((option) => (
    <Combobox.Option
      value={option.value}
      key={option.value}
      className={`data-[combobox-selected]:bg-dropdown-hover data-[combobox-active]:bg-dropdown-selected hover:bg-dropdown-hover ${
        option.color ? "text-" + option.color : ""
      }`}
      active={option.value === value}
    >
      {option.label || option.value}
    </Combobox.Option>
  ));

  useEffect(() => {
    combobox.selectFirstOption();
  }, [search, combobox]);

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        onSelect?.(optionValue); // handles value change
        setSearch(optionValue);
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
            <BaseInput
              placeholder="..."
              className="text-method"
              defaultValue={value}
              onChange={(value) => {
                setSearch(value);
                combobox.openDropdown();
              }}
              onClick={(e) => combobox?.openDropdown()}
              onFocus={() => setDropdown({ focusedEntityId: id })}
              onBlur={() => {
                combobox.closeDropdown();
                setSearch(value || "");
              }}
              onKeyDown={getHotkeyHandler([
                ["ctrl+space", () => combobox.openDropdown()],
              ])}
            />
          </Combobox.EventsTarget>

          <IconButton
            className="absolute -top-1.5 right-2 text-border bg-white rounded-full z-10"
            icon={FaCirclePlus}
            onClick={(e) => {
              combobox?.closeDropdown();
              addMethod?.();
            }}
            hidden={!isFocused}
          />
          <IconButton
            className="absolute -top-1.5 -right-1 text-border bg-white rounded-full z-10"
            icon={FaCircleXmark}
            onClick={(e) => {
              combobox?.closeDropdown();
              handleDelete?.();
            }}
            hidden={!isFocused}
          />
          {children}
        </div>
      </Combobox.DropdownTarget>
      <Combobox.Dropdown
        classNames={{
          dropdown: "absolute left-0 top-0 min-w-max",
        }}
      >
        {options?.length === 0 ? null : (
          <Combobox.Options className="overflow-y-auto bg-editor border border-border max-h-32 dropdown-scrollbar">
            {options}
          </Combobox.Options>
        )}
      </Combobox.Dropdown>
    </Combobox>
  );
}
