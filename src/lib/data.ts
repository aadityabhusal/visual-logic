import { IFunction, IType } from "./types";
import { createData } from "./utils";

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

export const globalContext: IFunction["context"] = {
  browser: createData("string", "firefox"),
};
