import { nanoid } from "nanoid";
import { operationMethods } from "./methods";
import { IData, IFunction, IType } from "./types";

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
    methods: [],
    selectedMethod: undefined,
  };
}

export function createFunction(): IFunction {
  return {
    id: nanoid(),
    context: {},
    entityType: "function",
    handler: undefined,
    name: "",
    parameter: [],
    return: createData("string", ""),
    statements: [],
  };
}

export function createDataResult<T extends keyof IType>(
  data: IData<T>
): IData | undefined {
  let result = data.selectedMethod?.handler(
    data,
    ...data.selectedMethod.parameters
  );
  if (result) {
    return {
      ...result,
      methods: operationMethods[result.type],
    };
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
