import { IMethod, IData, IType } from "./types";
import { createData, createStatement } from "./utils";

type IMethodOmit = Omit<IMethod, "result" | "id" | "entityType">;

export const comparisonMethods: IMethodOmit[] = [
  {
    name: "==",
    parameters: [createStatement(createData("string", "", true))],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value === p1.value),
  },
  {
    name: "!=",
    parameters: [createStatement(createData("string", "", true))],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value !== p1.value),
  },
  {
    name: "<",
    parameters: [createStatement(createData("string", "", true))],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value < p1.value),
  },
  {
    name: "<=",
    parameters: [createStatement(createData("string", "", true))],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value <= p1.value),
  },
  {
    name: ">",
    parameters: [createStatement(createData("string", "", true))],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value > p1.value),
  },
  {
    name: ">=",
    parameters: [createStatement(createData("string", "", true))],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", data.value >= p1.value),
  },
  {
    name: "&&",
    parameters: [createStatement(createData("string", "", true))],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", Boolean(data.value) && Boolean(p1.value)),
  },
  {
    name: "||",
    parameters: [createStatement(createData("string", "", true))],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData("boolean", Boolean(data.value) || Boolean(p1.value)),
  },
  {
    name: "then",
    parameters: [
      createStatement(createData("string", "", true)),
      createStatement(createData("string", "", true)),
    ],
    handler: (data: IData<"boolean">, p1: IData, p2: IData) => {
      return Boolean(data.value) ? p1 : p2;
    },
  },
];

export const stringMethods: IMethodOmit[] = [
  {
    name: "capitalize",
    parameters: [],
    handler: (data: IData<"string">) => {
      let func = (word: string) =>
        word.length ? word[0].toUpperCase() + word.slice(1) : "";
      return createData("string", data.value.split(" ").map(func).join(" "));
    },
  },
  {
    name: "concat",
    parameters: [createStatement(createData("string", ""))],
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
    parameters: [
      createStatement(createData("number", 0)),
      createStatement(createData("number", 0)),
    ],
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
    parameters: [createStatement(createData("string", ""))],
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
];

export const numberMethods: IMethodOmit[] = [
  {
    name: "add",
    parameters: [createStatement(createData("number", 0))],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value + p1.value);
    },
  },
  {
    name: "subtract",
    parameters: [createStatement(createData("number", 0))],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value - p1.value);
    },
  },
  {
    name: "multiply",
    parameters: [createStatement(createData("number", 0))],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value * p1.value);
    },
  },
  {
    name: "divide",
    parameters: [createStatement(createData("number", 0))],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData("number", data.value / p1.value);
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

export const booleanMethods: IMethodOmit[] = [
  {
    name: "toString",
    parameters: [],
    handler: (data: IData<"boolean">) => {
      return createData("string", String(data.value));
    },
  },
];

export const arrayMethods: IMethodOmit[] = [
  {
    name: "concat",
    parameters: [createStatement(createData("array", []))],
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
    parameters: [
      createStatement(createData("number", 0)),
      createStatement(createData("number", 0)),
    ],
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

export const objectMethods: IMethodOmit[] = [
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"object">) => {
      return createData("number", data.value.size);
    },
  },
];

export const operationMethods: Record<keyof IType, IMethodOmit[]> = {
  string: stringMethods.concat(comparisonMethods),
  number: numberMethods.concat(comparisonMethods),
  boolean: booleanMethods.concat(comparisonMethods),
  array: arrayMethods.concat(comparisonMethods),
  object: objectMethods.concat(comparisonMethods),
};
