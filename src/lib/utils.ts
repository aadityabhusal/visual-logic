import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import { operationMethods } from "./methods";
import { IData, IMethod, IOperation, IType, ITypeName } from "./types";

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

export function createEmptyData(type: ITypeName, value?: IType): IData {
  return {
    id: nanoid(),
    entityType: "data",
    value: {
      type: type,
      value: value || TypeMapper[type].defaultValue,
    },
  };
}

export function createData(operation: IOperation, data: IData): IData {
  const value = operation.selectedMethod?.handler(
    data.value,
    ...operation.selectedMethod.parameters
  );
  return {
    id: nanoid(),
    entityType: "data",
    value: {
      type: operation.selectedMethod.returnType,
      value,
    },
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
