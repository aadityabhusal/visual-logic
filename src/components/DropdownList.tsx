import { IData, IOperation, IStatement, IType } from "../lib/types";
import {
  createOperation,
  getClosureList,
  getStatementResult,
  createStatement,
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
  handelOperation,
  prevStatements,
  prevOperations,
}: {
  data: IStatement["data"];
  handleData: (data: IData, remove?: boolean) => void;
  handelOperation: (operation: IOperation, remove?: boolean) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}) {
  function handleDropdown(type: keyof IType) {
    (data.reference?.id || type !== (data as IData).type) &&
      handleData({
        type,
        id: data.id,
        isGeneric: data.isGeneric,
        entityType: "data",
        value: TypeMapper[type].defaultValue,
        reference: undefined,
      });
  }

  function selectData(dataOption: IData, reference: IStatement) {
    handleData({
      ...dataOption,
      id: data.id,
      isGeneric: data.isGeneric,
      reference: reference.name
        ? { id: reference.id, name: reference.name }
        : undefined,
    });
  }

  function selectOperations(
    operation: IOperation,
    reference: IStatement | IOperation
  ) {
    const parameters = resetParameters(operation.parameters);
    const closure = getClosureList(reference) || [];
    const statements = updateStatements({
      statements: operation.statements,
      previous: [
        ...prevOperations,
        ...prevStatements,
        ...closure,
        ...parameters,
      ],
    });

    handelOperation({
      ...operation,
      isGeneric: data.isGeneric,
      id: data.id,
      parameters,
      closure,
      statements,
      reference: reference.name
        ? { id: reference.id, name: reference.name }
        : undefined,
    });
  }

  return (
    <DropdownOptions>
      {Object.keys(TypeMapper).map((type) => {
        if (!data.isGeneric && type !== (data as IData).type) return;
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
      {data.isGeneric && (
        <DropdownOption
          onClick={() =>
            handelOperation(createOperation({ isGeneric: data.isGeneric }))
          }
          selected={!data.reference?.id && data.entityType === "operation"}
        >
          operation
        </DropdownOption>
      )}
      <div style={{ borderBottom: `1px solid ${theme.color.border}` }} />
      {prevStatements.map((statement) => {
        let result = getStatementResult(statement);
        if ((!data.isGeneric && !isSameType(result, data)) || !statement.name)
          return;
        return (
          <DropdownOption
            key={statement.id}
            onClick={() =>
              result.entityType === "operation"
                ? selectOperations(result, statement)
                : selectData(result, statement)
            }
            selected={statement.id === data.reference?.id}
          >
            {statement.name}
          </DropdownOption>
        );
      })}
      {prevOperations.map((operation) => {
        let result = getStatementResult(createStatement({ data: operation }));
        if (!data.isGeneric && !isSameType(result, data)) return;
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
