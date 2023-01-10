import { IData, IType } from "./types";
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

export const operators = {
  ">": (first: IData, second: IData) =>
    createData("boolean", first.value > second.value),
  "<": (first: IData, second: IData) =>
    createData("boolean", first.value < second.value),
  "<=": (first: IData, second: IData) =>
    createData("boolean", first.value <= second.value),
  ">=": (first: IData, second: IData) =>
    createData("boolean", first.value >= second.value),
  "==": (first: IData, second: IData) =>
    createData("boolean", first.value === second.value),
  "!=": (first: IData, second: IData) =>
    createData("boolean", first.value !== second.value),
  "&&": (first: IData, second: IData) =>
    createData("boolean", Boolean(first.value && second.value)),
  "||": (first: IData, second: IData) =>
    createData("boolean", Boolean(first.value || second.value)),
};
