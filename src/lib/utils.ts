import { nanoid } from "nanoid";
import { operationMethods } from "./methods";
import { ICreateMethodProps } from "./props";
import {
  IContextProps,
  IData,
  IFunction,
  IMethod,
  IStatement,
  IType,
} from "./types";

export function createData<T extends keyof IType>(
  type: T,
  value: IType[T]
): IData<T> {
  return {
    id: nanoid(),
    entityType: "data",
    type: type,
    value: value,
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

export function createStatement(data?: IData): IStatement {
  let newData = data || createData("string", "");
  return { id: nanoid(), return: newData, entities: [newData] };
}

export function createMethod({ data, index, name }: ICreateMethodProps) {
  let methods = operationMethods[data.type];
  let methodByName = name && methods.find((method) => (method.name = name));
  let newMethod = methodByName || methods[index || 0];
  let result = newMethod.handler(data, ...newMethod.parameters);
  return {
    ...newMethod,
    id: nanoid(),
    entityType: "method",
    result,
  } as IMethod;
}

export function getValueFromContext({
  id,
  context,
}: {
  id?: string;
  context: IContextProps;
}): IStatement | undefined {
  let value = context.statements.find((statement) => statement.id === id);
  if (!value && context.parent) {
    return getValueFromContext({ id, context: context.parent });
  } else return value;
}

export function getDataFromVariable(
  variable: IData,
  context: IContextProps
): IData {
  let data = getValueFromContext({ id: variable.referenceId, context });
  return {
    ...variable,
    type: data?.return.type || variable.type,
    value: data?.return.value || variable.value,
    name: data?.variable,
  };
}

export function parseData(data: IData): string {
  if (Array.isArray(data.value)) {
    return "[" + data.value.map((item) => parseData(item)) + "]";
  } else if (data.value instanceof Map) {
    let val = Array.from(data.value);
    return `{ ${val.map(([key, val]) => ` "${key}": ${parseData(val)}`)} }`;
  } else {
    return typeof data.value === "number" ? `${data.value}` : `"${data.value}"`;
  }
}

/*
export function sequenceToCode(sequence: IData[]): string {
  function parseData(data: IData[]): string {
    return data
      .map((item) => {
        if (Array.isArray(item.value.value)) {
          return "[" + item.value.value.map((item) => parseData([item])) + "]";
        } else if (item.value.value instanceof Map) {
          return (
            "{" +
            Array.from(item.value.value).map(
              ([key, val]: [string, IData]) => `${key}: ` + parseData([val])
            ) +
            "}"
          );
        } else {
          return typeof item.value.type === "number"
            ? item.value.value
            : `"${item.value.value}"`;
        }
      })
      .join();
  }
  let codeText = sequence.slice(1, -1).map((item) => {
    if (item.entityType === "operation") {
      return `.${item.selectedMethod.name}(${parseData(
        item.selectedMethod.parameters
      )})`;
    }
  });
  let firstItem = sequence[0] as IData;
  return parseData([firstItem]) + codeText.join("");
}
*/
