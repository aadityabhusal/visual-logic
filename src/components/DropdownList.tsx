import { IData, IOperation, IStatement, IType } from "../lib/types";
import { createOperation } from "../lib/utils";
import { DropdownOption, DropdownOptions } from "../ui/Dropdown";
import { TypeMapper } from "../lib/data";
import { theme } from "../lib/theme";

export function DropdownList({
  data,
  handleData,
  selectOperation,
  prevStatements,
}: {
  data: IStatement["data"];
  handleData: (data: IData, remove?: boolean) => void;
  selectOperation: (operation: IOperation, remove?: boolean) => void;
  prevStatements: IStatement[];
}) {
  let isGeneric = data.entityType === "operation" || data.isGeneric;

  function handleDropdown(type: keyof IType) {
    data.entityType === "data" &&
      (data.reference?.id || type !== data.type) &&
      handleData({
        ...data,
        type,
        value: TypeMapper[type].defaultValue,
        reference: undefined,
      });
  }

  function selectStatement(statement: IStatement) {
    if (data.entityType === "operation") return;
    handleData({
      ...data,
      type: statement.result.type,
      value: statement.result.value,
      reference: statement.name
        ? { id: statement.id, name: statement.name }
        : undefined,
    });
  }

  function selectOperations(statement: IStatement) {
    let operation = statement.data as IOperation;
    selectOperation({
      ...operation,
      reference: statement.name
        ? { id: statement.id, name: statement.name }
        : undefined,
    });
  }

  return (
    <DropdownOptions>
      {Object.keys(TypeMapper).map((type) => {
        if (!isGeneric && type !== (data as IData).type) return;
        return (
          <DropdownOption
            key={type}
            onClick={() => handleDropdown(type as keyof IType)}
            selected={!data.reference?.id && (data as IData).type === type}
          >
            {type}
          </DropdownOption>
        );
      })}
      {isGeneric && (
        <DropdownOption onClick={() => selectOperation(createOperation(""))}>
          operation
        </DropdownOption>
      )}
      <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
      {prevStatements.map((statement) => {
        if (!isGeneric && statement.result.type !== (data as IData).type)
          return;
        return (
          <DropdownOption
            key={statement.id}
            onClick={() =>
              statement.data.entityType === "operation"
                ? selectOperations(statement)
                : selectStatement(statement)
            }
            selected={statement.id === data.reference?.id}
          >
            {statement.name}
          </DropdownOption>
        );
      })}
    </DropdownOptions>
  );
}
