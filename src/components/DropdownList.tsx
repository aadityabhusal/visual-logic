import {
  IData,
  IDropdownItem,
  IOperation,
  IStatement,
  IType,
} from "../lib/types";
import {
  getClosureList,
  getStatementResult,
  createStatement,
  isSameType,
  resetParameters,
  createOperation,
  createData,
} from "../lib/utils";
import { updateStatements } from "../lib/update";
import { TypeMapper } from "../lib/data";

export function getDataDropdownList({
  data,
  onSelect,
  prevStatements,
  prevOperations,
}: {
  data: IStatement["data"];
  onSelect: (operation: IData | IOperation, remove?: boolean) => void;
  prevStatements: IStatement[];
  prevOperations: IOperation[];
}) {
  function selectData(dataOption: IData, reference: IStatement) {
    onSelect({
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

    onSelect({
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

  return [
    ...(Object.keys(TypeMapper) as (keyof IType)[]).reduce((acc, type) => {
      if (data.isGeneric || (data.reference && type === (data as IData).type)) {
        acc.push({
          entityType: "data",
          value: type,
          onClick: () => {
            onSelect(
              createData({ id: data.id, type, isGeneric: data.isGeneric })
            );
          },
        });
      }
      return acc;
    }, [] as IDropdownItem[]),
    ...(data.isGeneric
      ? ([
          {
            entityType: "operation",
            value: "operation",
            onClick: () =>
              onSelect(
                createOperation({ id: data.id, isGeneric: data.isGeneric })
              ),
          },
        ] as IDropdownItem[])
      : []),
    ...prevStatements.flatMap((statement) => {
      const result = getStatementResult(statement);
      if ((!data.isGeneric && !isSameType(result, data)) || !statement.name)
        return [];
      return {
        secondaryLabel:
          result.entityType === "data" ? result.type : "operation",
        value: statement.name,
        entityType: "data",
        onClick: () =>
          result.entityType === "operation"
            ? selectOperations(result, statement)
            : selectData(result, statement),
      } as IDropdownItem;
    }),
    ...prevOperations.flatMap((operation) => {
      let result = getStatementResult(createStatement({ data: operation }));
      if (!data.isGeneric && !isSameType(result, data)) return [];
      return {
        value: operation.name,
        entityType: "operation",
        secondaryLabel: "operation",
        onClick: () => selectOperations(operation, operation),
      } as IDropdownItem;
    }),
  ];
}
