import { nanoid } from "nanoid";
import { typeToObject } from "./data";
import { IData, IOperation, IValueConstructor, IValueObject } from "./types";

export function getMethods(object: IValueConstructor) {
  return Object.getOwnPropertyNames(object.prototype).filter(
    (prop) => prop != "constructor"
  ) as (keyof IValueObject)[];
}

export function createOperation(data: IData): IOperation {
  const methods = getMethods(typeToObject[typeof data.value]);
  return {
    id: nanoid(),
    entityType: "operation",
    methods,
    selectedMethod: methods[0],
  };
}

export function createData(operation: IOperation, data: IData): IData {
  let constructor = typeToObject[typeof data.value];
  let method = constructor(data.value as any)[operation.selectedMethod]();
  return {
    id: nanoid(),
    entityType: "data",
    value: method,
  };
}
