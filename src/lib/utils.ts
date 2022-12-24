import { nanoid } from "nanoid";
import { IContextProps, IData, IFunction, IMethod, IType } from "./types";

export function createData<T extends keyof IType>(
  type: T,
  value: IType[T]
): IData<T> {
  let returnVal = { type: type, value: value };
  return {
    id: nanoid(),
    entityType: "data",
    variable: undefined,
    return: returnVal,
    ...returnVal,
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

export function getDataFromVariable(
  variable: IData,
  context: IContextProps
): IData {
  let data = getValueFromContext({
    id: variable.referenceId,
    context,
  });
  let returnVal = { type: variable.type, value: variable.value };
  return {
    ...variable,
    name: data?.variable,
    return: data?.return || returnVal,
    ...(data?.return || returnVal),
    // Do not remove method here, instead show error for incompatible methods
    selectedMethod:
      variable.type === data?.return.type ? variable.selectedMethod : undefined,
  };
}

export function getPosition(target?: HTMLDivElement | null) {
  if (!target) return { top: 0, left: 0 };
  return {
    top: target.offsetTop + target.offsetHeight,
    left: target.offsetLeft,
  };
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
