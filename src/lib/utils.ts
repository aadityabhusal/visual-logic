import { nanoid } from "nanoid";
import { operationMethods } from "./methods";
import {
  ICondition,
  IData,
  IFunction,
  IMethod,
  IStatement,
  IType,
} from "./types";

export function createData<T extends keyof IType>(
  type: T,
  value: IType[T],
  isGeneric?: boolean
): IData<T> {
  return {
    id: nanoid(),
    entityType: "data",
    type: type,
    value: value,
    isGeneric,
  };
}

export function createFunction(): IFunction {
  return {
    id: nanoid(),
    entityType: "function",
    handler: undefined,
    name: "",
    parameter: [],
    return: createData("string", ""),
    statements: [],
  };
}

export function createStatement(data?: IData, methods?: IMethod[]): IStatement {
  let newData = data || createData("string", "", true);
  return {
    id: nanoid(),
    return: newData,
    entities: [newData, ...(methods || [])],
  };
}

export function createMethod({
  data,
  index,
  name,
}: {
  data: IData;
  index?: number;
  name?: string;
}) {
  let methods = operationMethods[data.type];
  let methodByName = name && methods.find((method) => method.name === name);
  let newMethod = methodByName || methods[index || 0];
  let result = newMethod.handler(data, ...newMethod.parameters);
  return {
    ...newMethod,
    id: nanoid(),
    entityType: "method",
    result,
  } as IMethod;
}

export function createCondition(): ICondition {
  let data = createData("string", "");
  const method = createMethod({ data, name: "==" });
  const condition = createStatement(data, [method]);
  return {
    id: nanoid(),
    entityType: "condition",
    condition,
    true: createData("string", ""),
    false: createData("string", ""),
  };
}

export function getLastEntity(entities: IStatement["entities"]) {
  if (entities.length === 1) return entities[0] as IData;
  else return (entities[entities.length - 1] as IMethod)?.result;
}

export function updateEntities(entities: IStatement["entities"]) {
  let result = [...entities];
  result.forEach((_, i) => {
    if (i === 0) return;
    let methods = result as IMethod[];
    let data = i === 1 ? (result[0] as IData) : methods[i - 1].result;
    methods[i].result = methods[i].handler(data, ...methods[i].parameters);
  });
  return result;
}

export function parseData(data: IData): string {
  if (Array.isArray(data.value)) {
    return "[" + data.value.map((item) => parseData(item)) + "]";
  } else if (data.value instanceof Map) {
    let val = Array.from(data.value);
    return `{ ${val.map(([key, val]) => ` "${key}": ${parseData(val)}`)} }`;
  } else {
    return typeof data.value === "string" ? `"${data.value}"` : `${data.value}`;
  }
}
