import { IData, IOperation, IStatement, IType } from "../lib/types";
import { createOperation } from "../lib/utils";
import { DropdownOption, DropdownOptions } from "../ui/Dropdown";
import { TypeMapper } from "../lib/data";
import { theme } from "../lib/theme";
import { getOperationResult } from "../lib/update";
import { updateStatements } from "../lib/update";

export function DropdownList({
  data,
  handleData,
  selectOperation,
  prevStatements,
  prevOperations,
}: {
  data: IStatement["data"];
  handleData: (data: IData, remove?: boolean) => void;
  selectOperation: (operation: IOperation, remove?: boolean) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}) {
  let isGeneric = data.entityType === "operation" || data.isGeneric;

  function handleDropdown(type: keyof IType) {
    (data.reference?.id || type !== (data as IData).type) &&
      handleData({
        type,
        id: data.id,
        isGeneric,
        entityType: "data",
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

  function selectOperations(
    operation: IOperation,
    reference: IStatement | IOperation
  ) {
    let defaultValue = (data: IData) => TypeMapper[data.type].defaultValue;

    const parameters = operation.parameters.map((param) => ({
      ...param,
      data: {
        ...param.data,
        isGeneric: false,
        value: defaultValue(data as IData),
      },
      result: { ...param.result, value: defaultValue(param.result) },
    }));

    let statements = updateStatements({
      statements: [...prevStatements, ...parameters, ...operation.statements],
      previousOperations: prevOperations,
    });

    selectOperation({
      ...operation,
      id: data.id,
      parameters,
      statements,
      reference: reference.name
        ? { id: reference.id, name: reference.name }
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
                ? selectOperations(statement.data, statement)
                : selectStatement(statement)
            }
            selected={statement.id === data.reference?.id}
          >
            {statement.name}
          </DropdownOption>
        );
      })}
      {prevOperations.map((operation) => {
        let operationResult = getOperationResult(operation);
        if (!isGeneric && operationResult.type !== (data as IData).type) return;
        return (
          <DropdownOption
            key={operation.id}
            onClick={() => selectOperations(operation, operation)}
            selected={operation.id === data.reference?.id}
          >
            {operation.name}
          </DropdownOption>
        );
      })}
    </DropdownOptions>
  );
}
