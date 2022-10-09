import { nanoid } from "nanoid";
import { operationMethods } from "./methods";
import { IData, IMethod, IOperation } from "./types";

export function createMethod(
  name: IMethod["name"],
  parameters: IMethod["parameters"],
  handler: IMethod["handler"]
): IMethod {
  return {
    name,
    parameters,
    handler,
  };
}

export function createOperation(data: IData): IOperation {
  const methods = operationMethods[typeof data.value];
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
