import { nanoid } from "nanoid";
import { operationMethods } from "./methods";
import { IData, IMethod, IOperation } from "./types";

export function createMethod(
  name: IMethod["name"],
  parameters: IMethod["parameters"] = [],
  returnType: IMethod["returnType"],
  handler: IMethod["handler"]
): IMethod {
  return {
    name,
    parameters,
    handler,
    returnType,
  };
}

export function createOperation(data: IData): IOperation {
  const methods = operationMethods[data.value.type];
  return {
    id: nanoid(),
    entityType: "operation",
    methods,
    selectedMethod: methods[0],
  };
}

export function createData(operation: IOperation, data: IData): IData {
  return {
    id: nanoid(),
    entityType: "data",
    value: operation.selectedMethod?.handler(
      data.value,
      ...operation.selectedMethod.parameters
    ),
  };
}

export function sequenceToCode(sequence: (IData | IOperation)[]): string {
  function parseData(value: IData["value"][]) {
    return value
      .map((item) => (typeof item === "number" ? item : `"${item}"`))
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
