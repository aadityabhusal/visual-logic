import { IconButton } from "../ui/IconButton";
import { FaPlus } from "react-icons/fa6";
import { IOperation, IStatement } from "../lib/types";
import { createData, createStatement, getDataDropdownList } from "../lib/utils";
import { useMemo } from "react";
import { Dropdown } from "./Dropdown";

export function AddStatement({
  id,
  onSelect,
  prevStatements = [],
  prevOperations = [],
}: {
  id: string;
  onSelect: (statement: IStatement) => void;
  prevStatements?: IStatement[];
  prevOperations?: IOperation[];
}) {
  const dropdownItems = useMemo(
    () =>
      getDataDropdownList({
        data: createData({ type: "string", isGeneric: true }),
        onSelect: (data) => onSelect(createStatement({ data })),
        prevOperations,
        prevStatements,
      }),
    [prevOperations, prevStatements]
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
          />
        )}
      />
    </div>
  );
}
