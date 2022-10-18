import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import { operationMethods } from "./methods";
import { IData, IOperation, IType, ITypeName } from "./types";

export function createOperation(data: IData): IOperation {
  const methods = operationMethods[data.value.type];
  return {
    id: nanoid(),
    entityType: "operation",
    methods,
    selectedMethod: methods[0],
  };
}

export function createData(type: ITypeName, value?: IType): IData {
  return {
    id: nanoid(),
    entityType: "data",
    value: {
      type: type,
      value: value || TypeMapper[type].defaultValue.value.value,
    },
  };
}

export function createOperationResult(
  operation: IOperation,
  data: IData
): IData {
  const value = operation.selectedMethod?.handler(
    data.value,
    ...operation.selectedMethod.parameters
  );
  return {
    id: nanoid(),
    entityType: "data",
    value,
  };
}

export function sequenceToCode(sequence: (IData | IOperation)[]): string {
  function parseData(value: IData["value"][]): string {
    return value
      .map((item) => {
        if (Array.isArray(item.value)) {
          return "[" + item.value.map((item) => parseData([item.value])) + "]";
        } else {
          return typeof item === "number" ? item : `"${item.value}"`;
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
  return parseData([firstItem.value]) + codeText.join("");
}

export function getValueType(value: IType): ITypeName | undefined {
  if (typeof value === "object" && !Array.isArray(value) && value !== null) {
    return "object";
  }
  return undefined;
}
