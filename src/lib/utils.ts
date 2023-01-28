import { nanoid } from "nanoid";
import { operationMethods } from "./methods";
import { IData, IFunction, IMethod, IStatement, IType } from "./types";

export function createData<T extends keyof IType>(
  type: T,
  value: IType[T],
  isGeneric?: boolean
): IData<T> {
  return {
    id: nanoid(),
    entityType: "data",
    type,
    value,
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

export function getFilteredMethods(data: IData) {
  return operationMethods[data.type].filter((item) => {
    let parameters = item.parameters.map((p) => p.result);
    let resultType = item.handler(data, ...parameters).type; // Optimize here
    return data.isGeneric || data.type === resultType;
  });
}

export function createMethod({ data, name }: { data: IData; name?: string }) {
  let methods = getFilteredMethods(data);
  let methodByName = methods.find((method) => method.name === name);
  let newMethod = methodByName || methods[0];

  let parameters = newMethod.parameters.map((item) => item.result);
  let result = newMethod.handler(data, ...parameters);
  return {
    ...newMethod,
    id: nanoid(),
    entityType: "method",
    result: { ...result, isGeneric: data.isGeneric },
  } as IMethod;
}

export function getLastEntity(statement: IStatement) {
  if (!statement.methods.length) return statement.data;
  return statement.methods[statement.methods.length - 1].result;
}

export function updateEntities(statement: IStatement) {
  let methods = [...statement.methods];
  let result = methods.reduce((prev, method, i) => {
    let data = i === 0 ? statement.data : prev[i - 1].result;
    let parameters = method.parameters.map((item) => item.result);
    let result = method.handler(data, ...parameters);
    let isGeneric = data.isGeneric;
    return [...prev, { ...method, result: { ...result, isGeneric } }];
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
