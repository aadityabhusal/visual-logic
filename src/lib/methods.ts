import { IData, IType } from "./types";
import { createData } from "./utils";

type IMethodList = {
  name: string;
  parameters: { type: keyof IType; isGeneric?: boolean }[];
  handler(...args: IData[]): IData;
};

export const comparisonMethods: IMethodList[] = [
  {
    name: "==",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value === p1.value),
  },
  {
    name: "!=",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value !== p1.value),
  },
  {
    name: "<",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value < p1.value),
  },
  {
    name: "<=",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value <= p1.value),
  },
  {
    name: ">",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value > p1.value),
  },
  {
    name: ">=",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value >= p1.value),
  },
  {
    name: "&&",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", Boolean(data.value) && Boolean(p1.value)),
  },
  {
    name: "||",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", Boolean(data.value) || Boolean(p1.value)),
  },
  {
    name: "then",
    parameters: [
      { type: "string", isGeneric: true },
      { type: "string", isGeneric: true },
    ],
    handler: (data: IData, p1: IData, p2: IData) => {
      return Boolean(data.value) ? p1 : p2;
    },
  },
];

export const stringMethods: IMethodList[] = [
  {
    name: "capitalize",
    parameters: [],
    handler: (data: IData<"string">) => {
      let mapper = (word: string) =>
        word.length ? word[0].toUpperCase() + word.slice(1) : "";
      return createData("string", data.value.split(" ").map(mapper).join(" "));
    },
  },
  {
    name: "concat",
    parameters: [{ type: "string" }],
    handler: (data: IData<"string">, p1: IData<"string">) => {
      return createData("string", data.value.concat(p1.value));
    },
  },
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData("number", data.value.length);
    },
  },
  {
    name: "slice",
    parameters: [{ type: "number" }, { type: "number" }],
    handler: (
      data: IData<"string">,
      p1: IData<"number">,
      p2: IData<"number">
    ) => {
      return createData("string", data.value.slice(p1.value, p2.value));
    },
  },
  {
    name: "split",
    parameters: [{ type: "string" }],
    handler: (data: IData<"string">, p1: IData<"string">) => {
      return createData(
        "array",
        data.value.split(p1.value).map((item) => createData("string", item))
      );
    },
  },
  {
    name: "toNumber",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData("number", Number(data.value) || 0);
    },
  },
  {
    name: "toUpperCase",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData("string", data.value.toUpperCase());
    },
  },
  {
    name: "toLowerCase",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData("string", data.value.toLowerCase());
    },
  },
];

export const numberMethods: IMethodList[] = [
  {
    name: "add",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value + p1.value);
    },
  },
  {
    name: "subtract",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value - p1.value);
    },
  },
  {
    name: "multiply",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value * p1.value);
    },
  },
  {
    name: "divide",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value / p1.value);
    },
  },
  {
    name: "power",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", Math.pow(data.value, p1.value));
    },
  },
  {
    name: "toString",
    parameters: [],
    handler: (data: IData<"number">) => {
      return createData("string", String(data.value));
    },
  },
];

export const booleanMethods: IMethodList[] = [
  {
    name: "toString",
    parameters: [],
    handler: (data: IData<"boolean">) => {
      return createData("string", String(data.value));
    },
  },
];

export const arrayMethods: IMethodList[] = [
  {
    name: "concat",
    parameters: [{ type: "array" }],
    handler: (data: IData<"array">, p1: IData<"array">) => {
      return createData("array", [...data.value, ...p1.value]);
    },
  },
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"array">) => {
      return createData("number", data.value.length);
    },
  },
  {
    name: "slice",
    parameters: [{ type: "number" }, { type: "number" }],
    handler: (
      data: IData<"array">,
      p1: IData<"number">,
      p2: IData<"number">
    ) => {
      return createData("array", data.value.slice(p1.value, p2.value));
    },
  },
  {
    name: "toString",
    parameters: [],
    handler: (data: IData<"array">) => {
      return createData("string", data.value.toString());
    },
  },
];

export const objectMethods: IMethodList[] = [
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"object">) => {
      return createData("number", data.value.size);
    },
  },
];

export const methodsList: Record<keyof IType, IMethodList[]> = {
  string: stringMethods.concat(comparisonMethods),
  number: numberMethods.concat(comparisonMethods),
  boolean: booleanMethods.concat(comparisonMethods),
  array: arrayMethods.concat(comparisonMethods),
  object: objectMethods.concat(comparisonMethods),
};
