import { IconButton } from "../ui/IconButton";
import { FaPlus } from "react-icons/fa6";
import { IStatement } from "../lib/types";
import { createData, createStatement, getDataDropdownList } from "../lib/utils";
import { ComponentPropsWithoutRef, useMemo } from "react";
import { Dropdown } from "./Dropdown";

export function AddStatement({
  id,
  onSelect,
  prevStatements = [],
  iconProps,
}: {
  id: string;
  onSelect: (statement: IStatement) => void;
  prevStatements?: IStatement[];
  iconProps?: Partial<ComponentPropsWithoutRef<typeof IconButton>>;
}) {
  const dropdownItems = useMemo(
    () =>
      getDataDropdownList({
        data: createData({ type: { kind: "undefined" }, isGeneric: true }),
        onSelect: (data) => onSelect(createStatement({ data })),
        prevStatements,
      }),
    [prevStatements]
  );

  return (
    <div className="w-max">
      <Dropdown
        id={id}
        items={dropdownItems}
        options={{ withSearch: true }}
        target={({ onChange, ...props }) => (
          <IconButton
            icon={FaPlus}
            size={14}
            className="mt-1 bg-editor"
            {...props}
            {...iconProps}
          />
        )}
      />
    </div>
  );
}
