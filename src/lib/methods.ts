import { nanoid } from "nanoid";
import { IData, IMethod, IOperation, IStatement, IType } from "./types";
import {
  createData,
  createOperation,
  createStatement,
  getOperationResult,
  getStatementResult,
  isSameType,
} from "./utils";
import { updateStatements } from "./update";

type IMethodList = {
  name: string;
  parameters: {
    type: keyof IType | "operation";
    parameters?: IMethodList["parameters"];
    isGeneric?: boolean;
  }[];
  handler(...args: IStatement["data"][]): IStatement["data"];
};

export const comparisonMethods: IMethodList[] = [
  {
    name: "eq",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData({ type: "boolean", value: data.value === p1.value }),
  },
  {
    name: "neq",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData({ type: "boolean", value: data.value !== p1.value }),
  },
  {
    name: "lt",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData({ type: "boolean", value: data.value < p1.value }),
  },
  {
    name: "lte",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData({ type: "boolean", value: data.value <= p1.value }),
  },
  {
    name: "gt",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData({ type: "boolean", value: data.value > p1.value }),
  },
  {
    name: "gte",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData({ type: "boolean", value: data.value >= p1.value }),
  },
  {
    name: "and",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData({
        type: "boolean",
        value: Boolean(data.value) && Boolean(p1.value),
      }),
  },
  {
    name: "or",
    parameters: [{ type: "string", isGeneric: true }],
    handler: (data: IData, p1: IData<typeof data.type>) =>
      createData({
        type: "boolean",
        value: Boolean(data.value) || Boolean(p1.value),
      }),
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
      return createData({
        type: "string",
        value:
          (data.value[0]?.toUpperCase() || "") + (data.value?.slice(1) || ""),
      });
    },
  },
  {
    name: "concat",
    parameters: [{ type: "string" }],
    handler: (data: IData<"string">, p1: IData<"string">) => {
      return createData({ type: "string", value: data.value.concat(p1.value) });
    },
  },
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData({ type: "number", value: data.value.length });
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
      return createData({
        type: "string",
        value: data.value.slice(p1.value, p2.value),
      });
    },
  },
  {
    name: "split",
    parameters: [{ type: "string" }],
    handler: (data: IData<"string">, p1: IData<"string">) => {
      return createData({
        type: "array",
        value: data.value.split(p1.value).map((item) =>
          createStatement({
            data: createData({ type: "string", value: item }),
          })
        ),
      });
    },
  },
  {
    name: "toNumber",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData({ type: "number", value: Number(data.value) || 0 });
    },
  },
  {
    name: "toUpperCase",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData({ type: "string", value: data.value.toUpperCase() });
    },
  },
  {
    name: "toLowerCase",
    parameters: [],
    handler: (data: IData<"string">) => {
      return createData({ type: "string", value: data.value.toLowerCase() });
    },
  },
];

export const numberMethods: IMethodList[] = [
  {
    name: "add",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData({ type: "number", value: data.value + p1.value });
    },
  },
  {
    name: "subtract",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData({ type: "number", value: data.value - p1.value });
    },
  },
  {
    name: "multiply",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData({ type: "number", value: data.value * p1.value });
    },
  },
  {
    name: "divide",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData({ type: "number", value: data.value / p1.value });
    },
  },
  {
    name: "power",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      return createData({
        type: "number",
        value: Math.pow(data.value, p1.value),
      });
    },
  },
  {
    name: "range",
    parameters: [{ type: "number" }],
    handler: (data: IData<"number">, p1: IData<"number">) => {
      let rev = data.value > p1.value;
      let [start, end] = rev ? [p1.value, data.value] : [data.value, p1.value];
      return createData({
        type: "array",
        value: Array.from(Array(end - start).keys()).map((value) =>
          createStatement({
            data: createData({
              type: "number",
              value: rev ? end - value : start + value,
            }),
          })
        ),
      });
    },
  },
  {
    name: "toString",
    parameters: [],
    handler: (data: IData<"number">) => {
      return createData({ type: "string", value: String(data.value) });
    },
  },
];

export const booleanMethods: IMethodList[] = [
  {
    name: "toString",
    parameters: [],
    handler: (data: IData<"boolean">) => {
      return createData({ type: "string", value: String(data.value) });
    },
  },
];

export const arrayMethods: IMethodList[] = [
  {
    name: "concat",
    parameters: [{ type: "array" }],
    handler: (data: IData<"array">, p1: IData<"array">) => {
      return createData({ type: "array", value: [...data.value, ...p1.value] });
    },
  },
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"array">) => {
      return createData({ type: "number", value: data.value.length });
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
      return createData({
        type: "array",
        value: data.value.slice(p1.value, p2.value),
      });
    },
  },
  {
    name: "toString",
    parameters: [],
    handler: (data: IData<"array">) => {
      return createData({
        type: "string",
        value: data.value
          .map((item) => {
            let result = getStatementResult(item);
            result.entityType === "data" ? result.value : "";
          })
          .toString(),
      });
    },
  },
  {
    name: "map",
    parameters: [
      {
        type: "operation",
        parameters: [
          { type: "string", isGeneric: true },
          { type: "number" },
          { type: "array" },
        ],
      },
    ],
    handler: (data: IData<"array">, operation: IOperation) => {
      let value = mapArrayParameters(data, operation);
      return createData({
        type: "array",
        value: value.map((data) => createStatement({ data })),
      });
    },
  },
  {
    name: "filter",
    parameters: [
      {
        type: "operation",
        parameters: [
          { type: "string", isGeneric: true },
          { type: "number" },
          { type: "array" },
        ],
      },
    ],
    handler: (data: IData<"array">, operation: IOperation) => {
      let value = mapArrayParameters(data, operation);
      return createData({
        type: "array",
        value: data.value.filter((_, i) => {
          let val = value[i];
          return val.entityType === "data" ? val.value : true;
        }),
      });
    },
  },
  {
    name: "find",
    parameters: [
      {
        type: "operation",
        parameters: [
          { type: "string", isGeneric: true },
          { type: "number" },
          { type: "array" },
        ],
      },
    ],
    handler: (data: IData<"array">, operation: IOperation) => {
      let value = mapArrayParameters(data, operation);
      let foundData = data.value.find((_, i) => {
        let val = value[i];
        return val.entityType === "data" ? val.value : true;
      })?.data as IData;
      return createData({
        type: foundData?.type || "string",
        value: foundData?.value || "",
      });
    },
  },
];

export const objectMethods: IMethodList[] = [
  {
    name: "length",
    parameters: [],
    handler: (data: IData<"object">) => {
      return createData({ type: "number", value: data.value.size });
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

function mapArrayParameters(data: IData<"array">, operation: IOperation) {
  return data.value.map((item, index, itemList) => {
    let itemResult = (getStatementResult(item) as IData).value;
    let paramsList = [itemResult, index, itemList];
    let newParams = operation.parameters.map((param, i) => ({
      ...param,
      data: { ...param.data, value: paramsList[i] },
    }));
    let updatedStatements = updateStatements({
      statements: [...newParams, ...operation.statements],
      previous: operation.closure,
    });
    return getOperationResult({
      ...operation,
      parameters: updatedStatements.slice(0, operation.parameters.length),
      statements: updatedStatements.slice(operation.parameters.length),
    });
  });
}

function getParams(item: IMethodList["parameters"][0]): IStatement["data"] {
  return item.type === "operation"
    ? createOperation({
        parameters: item.parameters?.map((item) =>
          createStatement({ data: getParams(item), name: "" })
        ),
        isGeneric: item.isGeneric,
      })
    : createData({ type: item.type, isGeneric: item.isGeneric });
}

export function getFilteredMethods(data: IData) {
  return methodsList[data.type].filter((item) => {
    let parameters = item.parameters.map((p) => getParams(p));
    return (
      data.isGeneric || isSameType(data, item.handler(data, ...parameters))
    );
  });
}

export function createMethod({ data, name }: { data: IData; name?: string }) {
  let methods = getFilteredMethods(data);
  let methodByName = methods.find((method) => method.name === name);
  let newMethod = methodByName || methods[0];

  let parameters = newMethod.parameters.map((item) => getParams(item));
  let result = newMethod.handler(data, ...parameters);
  return {
    id: nanoid(),
    entityType: "method",
    name: newMethod.name,
    parameters: parameters.map((item) => createStatement({ data: item })),
    result: { ...result, isGeneric: data.isGeneric },
  } as IMethod;
}
