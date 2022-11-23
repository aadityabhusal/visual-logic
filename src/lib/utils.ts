import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import { operationMethods } from "./methods";
import { IData, IOperation, IType } from "./types";

export function createOperation<T extends keyof IType>(
  data: IData<T>
): IOperation {
  const methods = operationMethods[data.value.type];
  return {
    id: nanoid(),
    entityType: "operation",
    methods,
    selectedMethod: methods[0],
  };
}

export function createData<T extends keyof IType>(
  type: T,
  value: IType[T]
): IData<T> {
  return {
    id: nanoid(),
    entityType: "data",
    value: {
      type: type,
      value: value || TypeMapper[type].defaultValue,
    },
  };
}

export function createOperationResult<T extends keyof IType>(
  operation: IOperation,
  data: IData<T>
): IData<keyof IType> {
  return operation.selectedMethod?.handler(
    data.value,
    ...operation.selectedMethod.parameters
  );
}

export function sequenceToCode(
  sequence: (IData<keyof IType> | IOperation)[]
): string {
  function parseData(data: IData<keyof IType>[]): string {
    return data
      .map((item) => {
        if (Array.isArray(item.value.value)) {
          return "[" + item.value.value.map((item) => parseData([item])) + "]";
        } else if (item.value.value instanceof Map) {
          return (
            "{" +
            Array.from(item.value.value).map(
              ([key, val]: [string, IData<keyof IType>]) =>
                `${key}: ` + parseData([val])
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
  let firstItem = sequence[0] as IData<keyof IType>;
  return parseData([firstItem]) + codeText.join("");
}
