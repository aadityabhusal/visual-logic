import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import {
  IData,
  IOperation,
  IStatement,
  DataType,
  IDropdownItem,
} from "./types";
import { updateStatements } from "./update";

export function createData<T extends DataType>(
  props: Partial<IData<T>>
): IData<T> {
  const type = (props.type || { kind: "undefined" }) as T;
  return {
    id: props.id ?? nanoid(),
    entityType: "data",
    type,
    value: props.value ?? TypeMapper[type.kind].defaultValue,
    isGeneric: props.isGeneric,
    reference: props.reference,
  };
}

export function createOperation(props?: Partial<IOperation>): IOperation {
  return {
    id: props?.id ?? nanoid(),
    isGeneric: props?.isGeneric,
    entityType: "operation",
    name: props?.name,
    parameters: props?.parameters || [],
    statements: props?.statements || [],
    closure: props?.closure || [],
    reference: props?.reference,
  };
}

export function createStatement(props?: Partial<IStatement>): IStatement {
  let newData =
    props?.data || createData({ type: { kind: "undefined" }, isGeneric: true });
  let newId = props?.id || nanoid();
  return {
    id: newId,
    name: props?.name,
    entityType: "statement",
    data: newData,
    methods: props?.methods || [],
  };
}

export function createVariableName({
  prefix,
  prev,
  indexOffset = 0,
}: {
  prefix: string;
  prev: (IStatement | IOperation | string)[];
  indexOffset?: number;
}) {
  const index = prev
    .map((s) => (typeof s === "string" ? s : s.name))
    .reduce((acc, cur) => {
      const match = cur?.match(new RegExp(`^${prefix}(\\d)?$`));
      if (!match) return acc;
      return match[1] ? Math.max(acc, Number(match[1]) + 1) : Math.max(acc, 1);
    }, indexOffset);
  return `${prefix}${index || ""}`;
}

export function isSameType(
  first: IStatement["data"],
  second: IStatement["data"]
): boolean {
  if (first.entityType === "operation" && second.entityType === "operation") {
    if (first.parameters.length !== second.parameters.length) return false;
    return first.parameters.every((firstParam, index) =>
      isSameType(firstParam.data, second.parameters[index].data)
    );
  } else if (first.entityType === "operation") {
    if (!first.reference?.isCalled) return false;
    return isSameType(getOperationResult(first), second);
  } else if (second.entityType === "operation") {
    if (!second.reference?.isCalled) return false;
    return isSameType(first, getOperationResult(second));
  } else {
    return isTypeCompatible(first.type, second.type);
  }
}

export function isTypeCompatible(
  actual: DataType,
  expected: DataType
): boolean {
  if (actual.kind === "list" && expected.kind === "list") {
    return isTypeCompatible(actual.elementType, expected.elementType);
  }

  if (actual.kind === "tuple" && expected.kind === "tuple") {
    return actual.elementsType.every((elementType, index) =>
      isTypeCompatible(elementType, expected.elementsType[index])
    );
  }

  if (actual.kind === "record" && expected.kind === "record") {
    return isTypeCompatible(actual.valueType, expected.valueType);
  }

  if (actual.kind === "object" && expected.kind === "object") {
    return Object.entries(expected.properties).every(
      ([key, expectedType]) =>
        actual.properties[key] &&
        isTypeCompatible(actual.properties[key], expectedType)
    );
  }

  if (actual.kind === "union") {
    return actual.types.some((t) => isTypeCompatible(t, expected));
  }

  return actual.kind === expected.kind;
}

export function getClosureList(reference: IStatement | IOperation) {
  const referenceData =
    reference.entityType === "statement" ? reference.data : reference;

  return referenceData.entityType === "operation"
    ? referenceData.reference?.isCalled
      ? referenceData.parameters.concat(referenceData.closure)
      : referenceData.closure
    : null;
}

export function getOperationResult(operation: IOperation) {
  let lastStatement = operation.statements.slice(-1)[0];
  return lastStatement
    ? getStatementResult(lastStatement)
    : createData({ type: { kind: "undefined" } });
}

export function getStatementResult(
  statement: IStatement,
  index?: number,
  prevEntity?: boolean
): IStatement["data"] {
  let data = statement.data;
  if (index) return statement.methods[index - 1]?.result;
  let lastStatement = statement.methods[statement.methods.length - 1];
  if (!prevEntity && lastStatement) return lastStatement.result;
  return data.entityType === "operation" && data.reference?.isCalled
    ? getOperationResult(data)
    : data;
}

export function resetParameters(
  parameters: IOperation["parameters"],
  argumentList?: IOperation["parameters"]
): IStatement[] {
  return parameters.map((param) => {
    let argData = argumentList?.find((item) => item.id === param.id)?.data;
    let paramData = { ...param.data, isGeneric: argData?.isGeneric };
    if (paramData.entityType === "data") {
      let argValue = argData?.entityType === "data" ? argData.value : undefined;
      paramData = {
        ...paramData,
        id: nanoid(),
        value: argValue || TypeMapper[paramData.type.kind].defaultValue,
      };
    } else {
      let argParams =
        argData?.entityType === "operation" ? argData.parameters : undefined;
      paramData = {
        ...paramData,
        id: nanoid(),
        parameters: resetParameters(paramData.parameters, argParams),
      };
    }
    return { ...param, id: nanoid(), data: paramData };
  });
}

export function getPreviousStatements(previous: (IStatement | IOperation)[]) {
  return previous.map((item) =>
    item.entityType === "operation"
      ? createStatement({ id: item.id, name: item.name, data: item })
      : item
  );
}

export function jsonParseReviver(_: string, data: IData) {
  return data.type.kind === "record" || data.type.kind === "object"
    ? { ...data, value: new Map(data.value as []) }
    : data;
}

export const getLocalStorage = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "", jsonParseReviver);
  } catch (error) {
    return null;
  }
};

export const setLocalStorage = (key: string, value: any) => {
  function replacer(_: string, value: IData["value"]) {
    return value instanceof Map ? Array.from(value.entries()) : value;
  }
  localStorage.setItem(key, JSON.stringify(value, replacer));
};

export function getDataDropdownList({
  data,
  onSelect,
  prevStatements,
  prevOperations,
}: {
  data: IStatement["data"];
  onSelect: (operation: IStatement["data"], remove?: boolean) => void;
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
    ...(Object.keys(TypeMapper) as DataType["kind"][]).reduce((acc, kind) => {
      if (
        data.isGeneric ||
        (data.reference && kind === (data as IData).type.kind)
      ) {
        acc.push({
          entityType: "data",
          value: kind,
          onClick: () => {
            onSelect(
              createData({
                id: data.id,
                type: TypeMapper[kind].type,
                isGeneric: data.isGeneric,
              })
            );
          },
        });
      }
      return acc;
    }, [] as IDropdownItem[]),
    ...(data.isGeneric || (data.reference && data.entityType === "operation")
      ? ([
          {
            entityType: "operation",
            value: "operation",
            onClick: () => {
              const parameters =
                data.entityType === "operation" ? data.parameters : [];
              onSelect(
                createOperation({
                  id: data.id,
                  isGeneric: data.isGeneric,
                  parameters,
                })
              );
            },
          },
        ] as IDropdownItem[])
      : []),
    ...prevStatements.flatMap((statement) => {
      const result = getStatementResult(statement);
      if ((!data.isGeneric && !isSameType(result, data)) || !statement.name)
        return [];
      return {
        secondaryLabel:
          result.entityType === "data" ? result.type.kind : "operation",
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
