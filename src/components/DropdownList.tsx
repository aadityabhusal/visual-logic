import { IData, IOperation, IStatement, IType } from "../lib/types";
import {
  createOperation,
  getClosureList,
  getStatementResult,
  getOperationResult,
  isSameType,
  resetParameters,
} from "../lib/utils";
import { DropdownOption, DropdownOptions } from "../ui/Dropdown";
import { TypeMapper } from "../lib/data";
import { theme } from "../lib/theme";
import { updateStatements } from "../lib/update";

export function DropdownList({
  data,
  handleData,
  selectOperation,
  prevStatements,
  prevOperations,
  isGeneric,
}: {
  data: IStatement["data"];
  handleData: (data: IData, remove?: boolean) => void;
  selectOperation: (operation: IOperation, remove?: boolean) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
  isGeneric?: boolean;
}) {
  function handleDropdown(type: keyof IType) {
    (data.reference?.id || type !== (data as IData).type) &&
      handleData({
        type,
        id: data.id,
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
    const parameters = resetParameters(operation.parameters);
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
        <DropdownOption
          onClick={() => selectOperation(createOperation({ name: "" }))}
          selected={!data.reference?.id && data.entityType === "operation"}
        >
          operation
        </DropdownOption>
      )}
      <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
      {prevStatements.map((statement) => {
        let result = getStatementResult(statement);
        if (!isGeneric && !isSameType(result, data)) return;
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
        if (!isGeneric && !isSameType(result, data)) return;
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
