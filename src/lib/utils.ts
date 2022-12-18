import { nanoid } from "nanoid";
import { IContextProps, IData, IFunction, IMethod, IType } from "./types";

export function createData<T extends keyof IType>(
  type: T,
  value: IType[T]
): IData<T> {
  return {
    id: nanoid(),
    entityType: "data",
    variable: undefined,
    type: type,
    value: value,
    selectedMethod: undefined,
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

export function createDataResult<T extends keyof IType>(
  data: IData<T>,
  selectedMethod?: IMethod
): IData | undefined {
  let method = selectedMethod || data.selectedMethod;
  return method?.handler(data, ...method.parameters);
}

export function getValueFromContext({
  id,
  context,
}: {
  id?: string;
  context: IContextProps;
}): IData | undefined {
  let value = context.statements.find((statement) => statement.id === id);
  if (!value && context.parent) {
    return getValueFromContext({ id, context: context.parent });
  } else return value;
}

export function getDataFromVariable(variable: IData, context: IContextProps) {
  let data = getValueFromContext({
    id: variable.referenceId,
    context,
  });
  return {
    ...variable,
    name: data?.variable,
    type: data?.type || variable.type,
    value: data?.value || variable.value,
    selectedMethod:
      variable.type === data?.type ? variable.selectedMethod : undefined,
  } as IData;
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
