import { IconButton } from "../ui/IconButton";
import { FaPlus } from "react-icons/fa6";
import { IOperation, IStatement } from "../lib/types";
import { createData, createStatement } from "../lib/utils";
import { useMemo } from "react";
import { getDataDropdownList } from "./DropdownList";
import { Dropdown } from "./Dropdown";

export function AddStatement({
  onSelect,
  prevStatements = [],
  prevOperations = [],
}: {
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
        options: { withDataTypes: true },
      }),
    [prevOperations, prevStatements]
  );

  return (
    <Dropdown
      items={dropdownItems}
      options={{ withSearch: true }}
      target={(props) => (
        <IconButton icon={FaPlus} className="mt-1" {...props} />
      )}
    />
  );
}
