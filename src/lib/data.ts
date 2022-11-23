import { IData, IType } from "./types";
import { createData, createOperation } from "./utils";

export const TypeMapper: {
  [T in keyof IType]: { defaultValue: IType[T] };
} = {
  string: {
    defaultValue: "",
  },
  number: {
    defaultValue: 0,
  },
  array: {
    defaultValue: [],
  },
  object: {
    defaultValue: new Map(),
  },
};
export const initialData = createData("string", "");
export const initialStatement = [initialData, createOperation(initialData)];
