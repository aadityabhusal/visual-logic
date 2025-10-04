import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import { methodsList } from "./methods";
import { IData, IOperation, IStatement, IType, IDropdownItem } from "./types";
import { updateStatements } from "./update";

export function createData<T extends keyof IType>(
  props: Partial<IData<T>>
): IData<T> {
  const type = (props.type || "string") as T;
  return {
    id: props.id ?? nanoid(),
    entityType: "data",
    type,
    value: props.value || TypeMapper[type].defaultValue,
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
  let newData = props?.data || createData({ type: "string", isGeneric: true });
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
    return first.type === second.type;
  }
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
    : createData({ type: "string" });
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
        value: argValue || TypeMapper[paramData.type].defaultValue,
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
  return data.type === "object"
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

function isValidReference(reference: unknown) {
  if (
    !(
      reference &&
      typeof reference === "object" &&
      !Array.isArray(reference)
    ) ||
    !("id" in reference && reference.id) ||
    !("name" in reference && reference.name)
  ) {
    return false;
  }
  return true;
}

function isValidData(data: unknown) {
  if (
    !(data && typeof data === "object" && !Array.isArray(data)) ||
    !("id" in data && data.id) ||
    !("entityType" in data && data.entityType === "data") ||
    !("type" in data && typeof data.type === "string") ||
    !("value" in data && data.value)
  ) {
    return false;
  }
  if (
    !(data.type in TypeMapper) ||
    typeof TypeMapper[data.type as keyof typeof TypeMapper].defaultValue !==
      typeof data.value
  ) {
    return false;
  }

  if (data.type === "array") {
    if (!Array.isArray(data.value)) return false;
    return data.value.every((item) => isValidStatement(item));
  }

  if (data.type === "object") {
    if (!(data.value instanceof Map)) return false;
    return data.value.values().every((value) => isValidStatement(value));
  }

  if ("reference" in data && !isValidReference(data.reference)) return false;

  return true;
}

function isValidMethod(method: unknown, data: unknown): boolean {
  if (
    !(method && typeof method === "object" && !Array.isArray(method)) ||
    !("id" in method && method.id) ||
    !("entityType" in method && method.entityType === "method") ||
    !(
      "name" in method &&
      typeof method.name === "string" &&
      method.name.trim()
    ) ||
    !("parameters" in method && Array.isArray(method.parameters)) ||
    !("result" in method && method.result)
  ) {
    return false;
  }

  if (
    !(data && typeof data === "object" && !Array.isArray(data)) ||
    !("entityType" in data)
  ) {
    return false;
  }
  if (data.entityType === "data") {
    if (
      !("type" in data) ||
      !(typeof data.type === "string") ||
      !(data.type in methodsList)
    ) {
      return false;
    }
    const availableMethods = methodsList[data.type as keyof typeof methodsList];
    const methodExists = availableMethods?.some((m) => m.name === method.name);
    if (!methodExists) return false;
  }

  if (!method.parameters.every(isValidStatement)) return false;

  if (
    !("result" in method) ||
    !(typeof method.result === "object") ||
    !("entityType" in method.result)
  ) {
    return false;
  }
  if (method.result.entityType === "operation") {
    if (!isValidOperation(method.result)) return false;
  } else if (method.result.entityType === "data") {
    if (!isValidData(method.result)) return false;
  }

  return true;
}

function isValidStatement(statement: unknown): boolean {
  if (
    !(
      statement &&
      typeof statement === "object" &&
      !Array.isArray(statement)
    ) ||
    !("id" in statement && statement.id) ||
    !("entityType" in statement && statement.entityType === "statement") ||
    !("data" in statement && statement.data) ||
    !("methods" in statement && Array.isArray(statement.methods))
  ) {
    return false;
  }
  const { data, methods } = statement;
  if (
    !(data && typeof data === "object" && !Array.isArray(data)) ||
    !("entityType" in data)
  ) {
    return false;
  }
  if (data.entityType === "data" && !isValidData(data)) return false;
  if (data.entityType === "operation" && !isValidOperation(data)) return false;
  if (!methods.every((method) => isValidMethod(method, data))) return false;

  return true;
}

export function isValidOperation(operation: unknown): boolean {
  if (
    !(
      operation &&
      typeof operation === "object" &&
      !Array.isArray(operation)
    ) ||
    !("id" in operation && operation.id) ||
    !("entityType" in operation && operation.entityType === "operation") ||
    !(
      "name" in operation &&
      typeof operation.name === "string" &&
      operation.name.trim()
    ) ||
    !("parameters" in operation && Array.isArray(operation.parameters)) ||
    !("closure" in operation && Array.isArray(operation.closure)) ||
    !("statements" in operation && Array.isArray(operation.statements))
  ) {
    return false;
  }
  const { parameters, closure, statements } = operation;
  if (
    !parameters.every(isValidStatement) ||
    !closure.every(isValidStatement) ||
    !statements.every(isValidStatement)
  ) {
    return false;
  }
  if ("reference" in operation && !isValidReference(operation.reference)) {
    return false;
  }

  return true;
}
