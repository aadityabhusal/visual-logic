import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import { methodsList } from "./methods";
import { IData, IOperation, IMethod, IStatement, IType } from "./types";

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
    reference: undefined,
  };
}

export function createOperation(): IOperation {
  let id = nanoid();
  return {
    id,
    entityType: "operation",
    handler: undefined,
    name: "func_" + id.slice(-4),
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
  return methodsList[data.type].filter((item) => {
    let parameters = item.parameters.map((p) =>
      createData(p.type, TypeMapper[p.type].defaultValue, p.isGeneric)
    );
    let resultType = item.handler(data, ...parameters).type; // Optimize here
    return data.isGeneric || data.type === resultType;
  });
}

export function createMethod({ data, name }: { data: IData; name?: string }) {
  let methods = getFilteredMethods(data);
  let methodByName = methods.find((method) => method.name === name);
  let newMethod = methodByName || methods[0];

  let parameters = newMethod.parameters.map((item) =>
    createData(item.type, TypeMapper[item.type].defaultValue, item.isGeneric)
  );
  let result = newMethod.handler(data, ...parameters);
  return {
    id: nanoid(),
    entityType: "method",
    name: newMethod.name,
    parameters: parameters.map((item) => createStatement(item)),
    handler: newMethod.handler,
    result: { ...result, isGeneric: data.isGeneric },
  } as IMethod;
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
