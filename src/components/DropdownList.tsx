import { IData, IOperation, IStatement, IType } from "../lib/types";
import { createOperation, getClosureList } from "../lib/utils";
import { DropdownOption, DropdownOptions } from "../ui/Dropdown";
import { TypeMapper } from "../lib/data";
import { theme } from "../lib/theme";
import { getStatementResult, getOperationResult } from "../lib/update";
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
    let result = getStatementResult(statement);
    if (result.entityType === "operation") {
      selectOperations(result, {
        ...result,
        id: statement.id,
        name: statement.name || "",
      });
    } else {
      handleData({
        ...data,
        type: result.type,
        value: result.value,
        reference: statement.name
          ? { id: statement.id, name: statement.name }
          : undefined,
      });
    }
  }

  function selectOperations(
    operation: IOperation,
    reference: IStatement | IOperation
  ) {
    const parameters = operation.parameters.map((param) => ({
      ...param,
      data: {
        ...param.data,
        isGeneric: false,
        value: TypeMapper[(data as IData).type].defaultValue,
      },
    }));
    const closure = getClosureList(reference) || [];
    const statements = updateStatements({
      statements: [
        ...prevStatements,
        ...closure,
        ...parameters,
        ...operation.statements,
      ],
      previousOperations: prevOperations,
    });

    selectOperation({
      ...operation,
      id: data.id,
      parameters,
      closure,
      statements: statements.slice(
        prevStatements.length + closure.length + parameters.length
      ),
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
        let result = getStatementResult(statement);
        let check =
          result.entityType === "operation"
            ? result.entityType !== data.entityType
            : result.type !== (data as IData).type;

        if (!isGeneric && check) return;
        return (
          <DropdownOption
            key={statement.id}
            onClick={() =>
              result.entityType === "operation"
                ? selectOperations(result, statement)
                : selectStatement(statement)
            }
            selected={statement.id === data.reference?.id}
          >
            {statement.name}
          </DropdownOption>
        );
      })}
      {prevOperations.map((operation) => {
        let result = getOperationResult(operation);
        let check =
          result.entityType === "operation"
            ? result.entityType !== data.entityType
            : result.type !== (data as IData).type;
        if (!isGeneric && check) return;
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
