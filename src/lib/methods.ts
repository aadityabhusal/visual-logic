import { IMethod, ITypeName } from "./types";
import { createMethod } from "./utils";

export const stringMethods = [
  createMethod("capitalize", [], "string", (value: string) => {
    let func = (word: string) =>
      word.length ? word[0].toUpperCase() + word.slice(1) : "";
    return value.split(" ").map(func).join(" ");
  }),
  createMethod(
    "concat",
    [{ type: "string", value: "" }],
    "string",
    (value: string, p1: string) => {
      return value.concat(p1);
    }
  ),
  createMethod("length", [], "number", (value: string) => {
    return value.length;
  }),
  createMethod(
    "slice",
    [
      { type: "number", value: 0 },
      { type: "number", value: 0 },
    ],
    "string",
    (value: string, p1: number, p2: number) => {
      return value.slice(p1, p2);
    }
  ),
  createMethod("toLowerCase", [], "string", (value: string) => {
    return value.toLowerCase();
  }),
  createMethod("toNumber", [], "string", (value: string) => {
    return Number(value) || 0;
  }),
  createMethod("toUpperCase", [], "string", (value: string) => {
    return value.toUpperCase();
  }),
];

export const numberMethods = [
  createMethod(
    "add",
    [{ type: "number", value: 0 }],
    "number",
    (value: number, p1: number) => {
      return value + p1;
    }
  ),
  createMethod(
    "subtract",
    [{ type: "number", value: 0 }],
    "number",
    (value: number, p1: number) => {
      return value - p1;
    }
  ),
  createMethod(
    "multiply",
    [{ type: "number", value: 0 }],
    "number",
    (value: number, p1: number) => {
      return value * p1;
    }
  ),
  createMethod(
    "divide",
    [{ type: "number", value: 0 }],
    "number",
    (value: number, p1: number) => {
      return value / p1;
    }
  ),
  createMethod("toString", [], "string", (value: number) => {
    return String(value);
  }),
];

export const arrayMethods = [
  createMethod(
    "concat",
    [{ type: "array", value: [] }],
    "array",
    (value: string[], p1: string[]) => {
      return value.concat(p1);
    }
  ),
  createMethod("length", [], "array", (value: string) => {
    return value.length;
  }),
  createMethod(
    "slice",
    [
      { type: "number", value: 0 },
      { type: "number", value: 0 },
    ],
    "array",
    (value: string, p1: number, p2: number) => {
      return value.slice(p1, p2);
    }
  ),
];

export const operationMethods: Record<ITypeName, IMethod[]> = {
  string: stringMethods,
  number: numberMethods,
  array: arrayMethods,
};
