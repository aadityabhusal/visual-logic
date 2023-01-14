import { IType } from "./types";

export const TypeMapper: {
  [T in keyof IType]: { defaultValue: IType[T] };
} = {
  string: {
    defaultValue: "",
  },
  number: {
    defaultValue: 0,
  },
  boolean: {
    defaultValue: false,
  },
  array: {
    defaultValue: [],
  },
  object: {
    defaultValue: new Map(),
  },
};
