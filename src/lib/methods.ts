import { IMethod, IData, IType } from "./types";
import { createData } from "./utils";

export const stringMethods: IMethod[] = [
  {
    name: "capitalize",
    parameters: [],
    handler: (data: IData<"string">) => {
      let func = (word: string) =>
        word.length ? word[0].toUpperCase() + word.slice(1) : "";
      return createData(
        "string",
        data.value.value.split(" ").map(func).join(" ")
      );
    },
  },
  {
    name: "concat",
    parameters: [createData("string", "")],
    handler: (data: IData<"string">, p1: IData<"string">) => {
      return createData("string", data.value.value.concat(p1.value.value));
    },
  },
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData("number", data.value.value.length);
    },
  },
  {
    name: "slice",
    parameters: [createData("number", 0), createData("number", 0)],
    handler: (
      data: IData<"string">,
      p1: IData<"number">,
      p2: IData<"number">
    ) => {
      return createData(
        "string",
        data.value.value.slice(p1.value.value, p2.value.value)
      );
    },
  },
  {
    name: "split",
    parameters: [createData("string", "")],
    handler: (data: IData<"string">, p1: IData<"string">) => {
      return createData(
        "array",
        data.value.value
          .split(p1.value.value)
          .map((item) => createData("string", item))
      );
    },
  },
  {
    name: "toNumber",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData("number", Number(data.value.value) || 0);
    },
  },
  {
    name: "toUpperCase",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData("string", data.value.value.toUpperCase());
    },
  },
];

export const numberMethods: IMethod[] = [
  {
    name: "add",
    parameters: [createData("number", 0)],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value.value + p1.value.value);
    },
  },
  {
    name: "subtract",
    parameters: [createData("number", 0)],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value.value - p1.value.value);
    },
  },
  {
    name: "multiply",
    parameters: [createData("number", 0)],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value.value * p1.value.value);
    },
  },
  {
    name: "divide",
    parameters: [createData("number", 0)],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value.value / p1.value.value);
    },
  },
  {
    name: "toString",
    parameters: [createData("number", 0)],
    handler: (data: IData<"number">) => {
      return createData("string", String(data.value.value));
    },
  },
];

export const arrayMethods: IMethod[] = [
  {
    name: "concat",
    parameters: [createData("array", [])],
    handler: (data: IData<"array">, p1: IData<"array">) => {
      return createData("array", [...data.value.value, ...p1.value.value]);
    },
  },
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"array">) => {
      return createData("number", data.value.value.length);
    },
  },
  {
    name: "slice",
    parameters: [createData("number", 0), createData("number", 0)],
    handler: (
      data: IData<"array">,
      p1: IData<"number">,
      p2: IData<"number">
    ) => {
      return createData(
        "array",
        data.value.value.slice(p1.value.value, p2.value.value)
      );
    },
  },
  {
    name: "toString",
    parameters: [],
    handler: (data: IData<"array">) => {
      return createData("string", data.value.value.toString());
    },
  },
];

export const objectMethods: IMethod[] = [
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"object">) => {
      return createData("number", data.value.value.size);
    },
  },
];

export const operationMethods: Record<keyof IType, IMethod[]> = {
  string: stringMethods,
  number: numberMethods,
  array: arrayMethods,
  object: objectMethods,
};
