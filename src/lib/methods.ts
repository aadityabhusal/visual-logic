import { nanoid } from "nanoid";
import { IData, IMethod, ITypeName, IValue } from "./types";

export const stringMethods: IMethod[] = [
  {
    name: "capitalize",
    parameters: [],
    handler: (value: IValue) => {
      let func = (word: string) =>
        word.length ? word[0].toUpperCase() + word.slice(1) : "";
      return {
        type: "string",
        value: value.value.split(" ").map(func).join(" "),
      };
    },
  },
  {
    name: "concat",
    parameters: [{ type: "string", value: "" }],
    handler: (value: IValue, p1: IValue) => {
      return {
        type: "string",
        value: value.value.concat(p1.value),
      } as IValue;
    },
  },
  {
    name: "length",
    parameters: [],
    handler: (value: IValue) => {
      return {
        type: "number",
        value: value.value.length,
      } as IValue<number, "number">;
    },
  },
  {
    name: "slice",
    parameters: [
      { type: "number", value: 0 },
      { type: "number", value: 0 },
    ],
    handler: (value: IValue, p1: IValue<number>, p2: IValue<number>) => {
      return {
        type: "string",
        value: value.value.slice(p1.value, p2.value),
      } as IValue;
    },
  },
  {
    name: "toNumber",
    parameters: [],
    handler: (value: IValue) => {
      return {
        type: "number",
        value: Number(value.value) || 0,
      } as IValue<number, "number">;
    },
  },
  {
    name: "toUpperCase",
    parameters: [],
    handler: (value: IValue) => {
      return {
        type: "string",
        value: value.value.toUpperCase(),
      } as IValue;
    },
  },
];

export const numberMethods: IMethod[] = [
  {
    name: "add",
    parameters: [{ type: "number", value: 0 }],
    handler: (value: IValue<number>, p1: IValue<number>) => {
      return {
        type: "number",
        value: value.value + p1.value,
      } as IValue<number, "number">;
    },
  },
  {
    name: "subtract",
    parameters: [{ type: "number", value: 0 }],
    handler: (value: IValue<number>, p1: IValue<number>) => {
      return {
        type: "number",
        value: value.value - p1.value,
      } as IValue<number, "number">;
    },
  },
  {
    name: "multiply",
    parameters: [{ type: "number", value: 0 }],
    handler: (value: IValue<number>, p1: IValue<number>) => {
      return {
        type: "number",
        value: value.value * p1.value,
      } as IValue<number, "number">;
    },
  },
  {
    name: "divide",
    parameters: [{ type: "number", value: 0 }],
    handler: (value: IValue<number>, p1: IValue<number>) => {
      return {
        type: "number",
        value: value.value / p1.value,
      } as IValue<number, "number">;
    },
  },
  {
    name: "toString",
    parameters: [{ type: "number", value: 0 }],
    handler: (value: IValue) => {
      return {
        type: "string",
        value: String(value),
      } as IValue;
    },
  },
];

export const arrayMethods: IMethod[] = [
  {
    name: "concat",
    parameters: [{ type: "array", value: [] }],
    handler: (
      value: IValue<IData[], "array">,
      p1: IValue<IData[], "array">
    ) => {
      return {
        type: "array",
        value: [...value.value, ...p1.value],
      } as IValue<IData[], "array">;
    },
  },
  {
    name: "length",
    parameters: [],
    handler: (value: IValue<Array<string | number>>) => {
      return {
        type: "number",
        value: value.value.length,
      } as IValue<number, "number">;
    },
  },
  {
    name: "slice",
    parameters: [],
    handler: (
      value: IValue<IData[], "array">,
      p1: IValue<number>,
      p2: IValue<number>
    ) => {
      return {
        type: "array",
        value: value.value.slice(p1.value, p2.value),
      } as IValue<IData[], "array">;
    },
  },
  {
    name: "toString",
    parameters: [],
    handler: (value: IValue<Array<string | number>>) => {
      return {
        type: "string",
        value: value.value.toString(),
      } as IValue;
    },
  },
];

export const operationMethods: Record<ITypeName, IMethod[]> = {
  string: stringMethods,
  number: numberMethods,
  array: arrayMethods,
};
