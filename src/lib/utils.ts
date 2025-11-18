import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import {
  IData,
  IStatement,
  DataType,
  IDropdownItem,
  DataValue,
  OperationType,
  ConditionType,
} from "./types";

export function createData<T extends DataType>(
  props: Partial<IData<T>>
): IData<T> {
  const type = (props.type || { kind: "undefined" }) as T;
  let defaultValue = TypeMapper[type.kind].defaultValue as DataValue<T>;
  if (props.type?.kind === "condition") {
    defaultValue = {
      condition: createStatement(),
      true: createStatement(),
      false: createStatement(),
      result: createData({ type: { kind: "boolean" }, value: false }),
    } as DataValue<T>;
  }
  return {
    id: props.id ?? nanoid(),
    entityType: "data",
    type,
    value: props.value ?? defaultValue,
    isGeneric: props.isGeneric,
    reference: props.reference,
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
    operations: props?.operations || [],
  };
}

export function createVariableName({
  prefix,
  prev,
  indexOffset = 0,
}: {
  prefix: string;
  prev: (IStatement | string)[];
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

export function isTypeCompatible(first: DataType, second: DataType): boolean {
  if (first.kind === "operation" && second.kind === "operation") {
    if (first.parameters.length !== second.parameters.length) return false;
    if (!isTypeCompatible(first.result, second.result)) return false;
    return first.parameters.every((firstParam, index) =>
      isTypeCompatible(firstParam.type, second.parameters[index].type)
    );
  }

  if (first.kind === "array" && second.kind === "array") {
    return isTypeCompatible(first.elementType, second.elementType);
  }

  if (first.kind === "object" && second.kind === "object") {
    const firstKeys = Object.keys(first.properties);
    const secondKeys = Object.keys(second.properties);
    if (firstKeys.length !== secondKeys.length) return false;
    return secondKeys.every(
      (key) =>
        first.properties[key] &&
        isTypeCompatible(first.properties[key], second.properties[key])
    );
  }

  if (first.kind === "union" && second.kind === "union") {
    if (first.types.length !== second.types.length) return false;
    // Bi-directional check to maintain order-independence and avoid duplicate types
    return (
      first.types.every((firstType) =>
        second.types.some((secondType) =>
          isTypeCompatible(firstType, secondType)
        )
      ) &&
      second.types.every((secondType) =>
        first.types.some((firstType) => isTypeCompatible(firstType, secondType))
      )
    );
  }

  if (first.kind === "union") {
    return first.types.some((t) => isTypeCompatible(t, second));
  }

  if (second.kind === "union") {
    return second.types.some((t) => isTypeCompatible(first, t));
  }

  return first.kind === second.kind;
}

export function isDataOfType<K extends DataType["kind"]>(
  data: IData<DataType> | undefined,
  kind: K
): data is IData<Extract<DataType, { kind: K }>> {
  return data?.type.kind === kind;
}

// TODO: Make use of the data type to create a better type for result e.g. a union type
export function getStatementResult(
  statement: IStatement,
  index?: number,
  prevEntity?: boolean
): IData {
  let data = statement.data;
  if (index) {
    const result = statement.operations[index - 1]?.value.result;
    if (!result) return createData({ type: { kind: "undefined" } });
    return result;
  }
  let lastOperation = statement.operations[statement.operations.length - 1];
  if (!prevEntity && lastOperation) {
    const result = lastOperation.value.result;
    if (!result) return createData({ type: { kind: "undefined" } });
    return result;
  }
  if (isDataOfType(data, "condition")) {
    return data.value.result ?? getConditionResult(data.value);
  }
  return data;
}

export function getConditionResult(condition: DataValue<ConditionType>): IData {
  const conditionResult = getStatementResult(condition.condition);
  const conditionValue = conditionResult.value;
  const isTrue =
    conditionValue === true ||
    (typeof conditionValue === "string" && conditionValue.length > 0) ||
    (typeof conditionValue === "number" && conditionValue !== 0);
  return getStatementResult(isTrue ? condition.true : condition.false);
}

export function resetParameters(
  parameters: DataValue<OperationType>["parameters"],
  argumentList?: DataValue<OperationType>["parameters"]
): IStatement[] {
  return parameters.map((param) => {
    let argData = argumentList?.find((item) => item.id === param.id)?.data;
    let paramData = { ...param.data, isGeneric: argData?.isGeneric } as IData;
    if (isDataOfType(paramData, "operation")) {
      let argParams = isDataOfType(argData, "operation")
        ? argData.value.parameters
        : undefined;
      const params = resetParameters(paramData.value.parameters, argParams);
      paramData = {
        ...paramData,
        id: nanoid(),
        type: getOperationType(params, paramData.value.statements),
        value: {
          ...paramData.value,
          parameters: params,
        },
      };
    } else {
      paramData = {
        ...paramData,
        id: nanoid(),
        value: argData?.value || TypeMapper[paramData.type.kind].defaultValue,
      };
    }
    return { ...param, id: nanoid(), data: paramData };
  });
}

export function jsonParseReviver(_: string, data: IData) {
  return data.type.kind === "object"
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

export function getArrayElementType(elements: IStatement[]): DataType {
  if (elements.length === 0) return { kind: "undefined" };
  const firstType = elements[0].data.type;
  const allSameType = elements.every((element) => {
    return isTypeCompatible(element.data.type, firstType);
  });
  if (allSameType) return firstType;

  const unionTypes = elements.reduce((acc, element) => {
    const elementType = element.data.type;
    const exists = acc.some((t) => isTypeCompatible(t, elementType));
    if (!exists) acc.push(elementType);
    return acc;
  }, [] as DataType[]);
  return { kind: "union", types: unionTypes };
}

export function getObjectPropertiesType(entries: Map<string, IStatement>): {
  [key: string]: DataType;
} {
  const properties: { [key: string]: DataType } = {};
  entries.forEach((statement, key) => {
    properties[key] = statement.data.type;
  });

  return properties;
}

export function getOperationType(
  parameters: IStatement[],
  statements: IStatement[]
): OperationType {
  const parameterTypes = parameters.map((param) => ({
    name: param.name,
    type: param.data.type,
  }));

  let resultType: DataType = { kind: "undefined" };
  if (statements.length > 0) {
    const lastStatement = statements[statements.length - 1];
    resultType = getStatementResult(lastStatement).type;
  }

  return { kind: "operation", parameters: parameterTypes, result: resultType };
}

export function getDataDropdownList({
  data,
  onSelect,
  prevStatements,
}: {
  data: IStatement["data"];
  onSelect: (operation: IStatement["data"], remove?: boolean) => void;
  prevStatements: IStatement[];
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

  return [
    ...(Object.keys(TypeMapper) as DataType["kind"][]).reduce((acc, kind) => {
      if (["unknown"].includes(kind)) return acc;
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
    ...prevStatements.flatMap((statement) => {
      const result = getStatementResult(statement);
      if (
        (!data.isGeneric && !isTypeCompatible(result.type, data.type)) ||
        !statement.name
      )
        return [];
      return {
        secondaryLabel:
          result.entityType === "data" ? result.type.kind : "operation",
        value: statement.name,
        entityType: "data",
        onClick: () => selectData(result, statement),
      } as IDropdownItem;
    }),
  ];
}
