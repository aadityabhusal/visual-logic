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
    result: createData("string", ""),
    statements: [],
  };
}

export function createStatement(data?: IData, methods?: IMethod[]): IStatement {
  let newData = data || createData("string", "", true);
  return {
    id: nanoid(),
    entityType: "statement",
    data: newData,
    result: newData,
    methods: methods || [],
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
  const first = createStatement();
  return {
    id: nanoid(),
    entityType: "condition",
    condition,
    true: first,
    false: createStatement(),
    result: first.result,
  };
}

export function getLastEntity(statement: IStatement) {
  if (!statement.methods.length) return statement.data;
  return statement.methods[statement.methods.length - 1].result;
}

export function updateEntities(statement: IStatement) {
  let methods = [...statement.methods];
  let result = methods.reduce((prev, method, i) => {
    let data = i === 0 ? statement.data : prev[i - 1].result;
    let result = method.handler(data, ...method.parameters);
    return [...prev, { ...method, result }];
  }, [] as IMethod[]);
  return { ...statement, methods: result };
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
