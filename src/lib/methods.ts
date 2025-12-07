import { nanoid } from "nanoid";
import {
  IData,
  IStatement,
  DataType,
  OperationType,
  StringType,
  ArrayType,
  NumberType,
  UnknownType,
  Context,
  BooleanType,
  ObjectType,
} from "./types";
import {
  createData,
  createStatement,
  createVariableName,
  getStatementResult,
  inferTypeFromValue,
  isDataOfType,
  isTypeCompatible,
} from "./utils";
import { executeOperation } from "./execution";

export type Parameter = {
  type: DataType;
  name?: string;
  isTypeEditable?: boolean;
};
export type OperationListItem = {
  name: string;
  parameters: ((data: IData) => Parameter[]) | Parameter[];
  result: ((data: IData) => DataType) | DataType;
  isResultTypeFixed?: boolean; // Show error when type mismatches in the UI
} & ( // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { handler: (...args: IData<any>[]) => IData }
  | { statements: IStatement[] }
);

const unknownOperations: OperationListItem[] = [
  {
    name: "equals",
    parameters: (data) => [{ type: { kind: "unknown" } }, { type: data.type }],
    result: { kind: "boolean" },
    handler: (data: IData, p1: IData) => {
      return createData({
        type: { kind: "boolean" },
        value: JSON.stringify(data.value) === JSON.stringify(p1.value),
      });
    },
  },
  {
    name: "toString",
    parameters: [{ type: { kind: "unknown" } }],
    result: { kind: "string" },
    handler: (data: IData<StringType>) => {
      return createData({
        type: { kind: "string" },
        value: String(data.value),
      });
    },
  },
  {
    name: "typeof",
    parameters: (data) => [
      { type: { kind: "union", types: [] } },
      { type: data.type },
    ],
    result: { kind: "boolean" },
    handler: (data: IData<UnknownType>, typeData: IData) => {
      return createData({
        type: { kind: "boolean" },
        value: isTypeCompatible(
          inferTypeFromValue(data.type),
          inferTypeFromValue(typeData.value)
        ),
      });
    },
  },
];

const undefinedOperations: OperationListItem[] = [
  {
    name: "getCurrentTime",
    parameters: [{ type: { kind: "undefined" } }],
    result: { kind: "string" },
    handler: () => {
      return createData({
        type: { kind: "string" },
        value: new Date().toISOString(),
      });
    },
  },
];

const booleanOperations: OperationListItem[] = [
  {
    name: "and",
    parameters: [
      { type: { kind: "boolean" } },
      { type: { kind: "undefined" }, isTypeEditable: true },
    ],
    result: { kind: "boolean" },
    handler: (data: IData<BooleanType>, p1: IData) => {
      return createData({
        type: { kind: "boolean" },
        value: Boolean(data.value) && Boolean(p1.value),
      });
    },
  },
  {
    name: "or",
    parameters: [
      { type: { kind: "boolean" } },
      { type: { kind: "undefined" }, isTypeEditable: true },
    ],
    result: { kind: "boolean" },
    handler: (data: IData<UnknownType>, p1: IData) => {
      return createData({
        type: { kind: "boolean" },
        value: Boolean(data.value) || Boolean(p1.value),
      });
    },
  },
  {
    name: "not",
    parameters: [{ type: { kind: "boolean" } }],
    result: { kind: "boolean" },
    handler: (data: IData<BooleanType>) => {
      return createData({ type: { kind: "boolean" }, value: !data.value });
    },
  },
  {
    name: "thenElse",
    parameters: [
      { type: { kind: "boolean" } },
      { type: { kind: "undefined" }, isTypeEditable: true },
      { type: { kind: "undefined" }, isTypeEditable: true },
    ],
    result: { kind: "unknown" },
    handler: (data: IData<BooleanType>, p1: IData, p2: IData) => {
      return createData({
        type: { kind: "unknown" },
        value: data.value ? p1.value : p2.value,
      });
    },
  },
];

const stringOperations: OperationListItem[] = [
  {
    name: "capitalize",
    parameters: [{ type: { kind: "string" } }],
    result: { kind: "string" },
    handler: (data: IData<StringType>) => {
      return createData({
        type: { kind: "string" },
        value:
          (data.value[0]?.toUpperCase() || "") + (data.value?.slice(1) || ""),
      });
    },
  },
  {
    name: "concat",
    parameters: [{ type: { kind: "string" } }, { type: { kind: "string" } }],
    result: { kind: "string" },
    handler: (data: IData<StringType>, p1: IData<StringType>) => {
      return createData({
        type: { kind: "string" },
        value: data.value.concat(p1.value),
      });
    },
  },
  {
    name: "includes",
    parameters: [{ type: { kind: "string" } }, { type: { kind: "string" } }],
    result: { kind: "boolean" },
    handler: (data: IData<StringType>, p1: IData<StringType>) => {
      return createData({
        type: { kind: "boolean" },
        value: data.value.includes(p1.value),
      });
    },
  },
  {
    name: "length",
    parameters: [{ type: { kind: "string" } }],
    result: { kind: "number" },
    handler: (data: IData<StringType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value.length,
      });
    },
  },
  {
    name: "slice",
    parameters: [
      { type: { kind: "string" } },
      { type: { kind: "number" } },
      { type: { kind: "number" } },
    ],
    result: { kind: "string" },
    handler: (
      data: IData<StringType>,
      p1: IData<NumberType>,
      p2: IData<NumberType>
    ) => {
      return createData({
        type: { kind: "string" },
        value: data.value.slice(p1.value, p2.value),
      });
    },
  },
  {
    name: "split",
    parameters: [{ type: { kind: "string" } }, { type: { kind: "string" } }],
    result: { kind: "array", elementType: { kind: "string" } },
    handler: (data: IData<StringType>, p1: IData<StringType>) => {
      return createData({
        type: { kind: "array", elementType: { kind: "string" } },
        value: data.value.split(p1.value).map((item) =>
          createStatement({
            data: createData({ type: { kind: "string" }, value: item }),
          })
        ),
      });
    },
  },
];

const numberOperations: OperationListItem[] = [
  {
    name: "add",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "number" },
    handler: (data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value + p1.value,
      });
    },
  },
  {
    name: "subtract",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "number" },
    handler: (data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value - p1.value,
      });
    },
  },
  {
    name: "multiply",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "number" },
    handler: (data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value * p1.value,
      });
    },
  },
  {
    name: "divide",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "number" },
    handler: (data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value / p1.value,
      });
    },
  },
  {
    name: "power",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "number" },
    handler: (data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: Math.pow(data.value, p1.value),
      });
    },
  },
  {
    name: "mod",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "number" },
    handler: (data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value % p1.value,
      });
    },
  },
  {
    name: "lt",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "boolean" },
    handler: (data: IData<NumberType>, p1: IData<typeof data.type>) =>
      createData({ type: { kind: "boolean" }, value: data.value < p1.value }),
  },
  {
    name: "lte",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "boolean" },
    handler: (data: IData<NumberType>, p1: IData<typeof data.type>) =>
      createData({ type: { kind: "boolean" }, value: data.value <= p1.value }),
  },
  {
    name: "gt",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "boolean" },
    handler: (data: IData<NumberType>, p1: IData<typeof data.type>) =>
      createData({ type: { kind: "boolean" }, value: data.value > p1.value }),
  },
  {
    name: "gte",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "boolean" },
    handler: (data: IData<NumberType>, p1: IData<typeof data.type>) =>
      createData({ type: { kind: "boolean" }, value: data.value >= p1.value }),
  },
  {
    name: "range",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    result: { kind: "array", elementType: { kind: "number" } },
    handler: (data: IData<NumberType>, p1: IData<NumberType>) => {
      const rev = data.value > p1.value;
      const [start, end] = rev
        ? [p1.value, data.value]
        : [data.value, p1.value];
      return createData({
        type: { kind: "array", elementType: { kind: "number" } },
        value: Array.from(Array(end - start).keys()).map((value) =>
          createStatement({
            data: createData({
              type: { kind: "number" },
              value: rev ? end - value : start + value,
            }),
          })
        ),
      });
    },
  },
];

export const arrayOperations: OperationListItem[] = [
  {
    name: "at",
    parameters: [
      { type: { kind: "array", elementType: { kind: "unknown" } } },
      { type: { kind: "number" } },
    ],
    result: (data) => (data.type as ArrayType).elementType,
    handler: (data: IData<ArrayType>, p1: IData<NumberType>) => {
      const item = data.value.at(p1.value);
      if (!item) return createData({ type: { kind: "undefined" } });
      const value = getStatementResult(item) as IData;
      return createData({ type: value.type, value: value.value });
    },
  },
  {
    name: "map",
    parameters: (data) => {
      const elementType = (data.type as ArrayType).elementType ?? {
        kind: "undefined",
      };
      return [
        { type: { kind: "array", elementType: { kind: "unknown" } } },
        {
          type: {
            kind: "operation",
            parameters: [
              { name: "item", type: elementType },
              { name: "index", type: { kind: "number" } },
              { name: "arr", type: { kind: "array", elementType } },
            ],
            result: { kind: "string" },
          },
        },
      ];
    },
    result: (data) => data.type,
    handler: (data: IData<ArrayType>, operation: IData<OperationType>) => {
      const value = mapArrayParameters(data, operation);
      return createData({
        type: {
          kind: "array",
          elementType: { kind: "union", types: value.map((item) => item.type) },
        },
        value: value.map((data) => createStatement({ data })),
      });
    },
  },
  {
    name: "find",
    parameters: (data) => {
      const elementType = (data.type as ArrayType).elementType ?? {
        kind: "undefined",
      };
      return [
        { type: { kind: "array", elementType: { kind: "unknown" } } },
        {
          type: {
            kind: "operation",
            parameters: [
              { name: "item", type: elementType },
              { name: "index", type: { kind: "number" } },
              { name: "arr", type: { kind: "array", elementType } },
            ],
            result: { kind: "string" },
          },
        },
      ];
    },
    result: { kind: "string" },
    handler: (data: IData<ArrayType>, operation: IData<OperationType>) => {
      const value = mapArrayParameters(data, operation);
      const foundData = data.value.find((_, i) => {
        const val = value[i];
        return val.entityType === "data" ? val.value : true;
      })?.data as IData;
      return createData({
        type: foundData?.type || { kind: "string" },
        value: foundData?.value || "",
      });
    },
  },
];

export const objectOperations: OperationListItem[] = [
  {
    name: "get",
    parameters: [
      { type: { kind: "object", properties: {} } },
      { type: { kind: "string" } },
    ],
    result: { kind: "undefined" },
    handler(data: IData<ObjectType>, p1: IData<StringType>) {
      const item = data.value.get(p1.value);
      if (!item) return createData({ type: { kind: "undefined" } });
      const value = getStatementResult(item) as IData;
      return createData({ type: value.type, value: value.value });
    },
  },
  {
    name: "has",
    parameters: [
      { type: { kind: "object", properties: {} } },
      { type: { kind: "string" } },
    ],
    result: { kind: "boolean" },
    handler(data: IData<ObjectType>, p1: IData<StringType>) {
      return createData({
        type: { kind: "boolean" },
        value: data.value.has(p1.value),
      });
    },
  },
  {
    name: "keys",
    parameters: [{ type: { kind: "object", properties: {} } }],
    result: { kind: "array", elementType: { kind: "string" } },
    handler(data: IData<ObjectType>) {
      return createData({
        type: { kind: "array", elementType: { kind: "string" } },
        value: [...data.value.keys()].map((item) =>
          createStatement({
            data: createData({ type: { kind: "string" }, value: item }),
          })
        ),
      });
    },
  },
  {
    name: "values",
    parameters: [{ type: { kind: "object", properties: {} } }],
    result: { kind: "undefined" },
    handler(data: IData<ObjectType>) {
      return createData({
        type: {
          kind: "array",
          elementType: {
            kind: "union",
            types: Object.values(data.type.properties),
          },
        },
        value: [...data.value.values()].map((item) => {
          const itemResult = getStatementResult(item) as IData;
          return createStatement({
            data: createData({
              type: itemResult.type,
              value: itemResult.value,
            }),
          });
        }),
      });
    },
  },
];

const operationOperations: OperationListItem[] = [
  {
    name: "call",
    parameters: (data) => [
      {
        type: {
          kind: "operation",
          parameters: [{ type: { kind: "string" } }],
          result: { kind: "string" },
        },
      },
      ...(isDataOfType(data, "operation") ? data.type.parameters : []),
    ],
    result: { kind: "undefined" },
    handler: (data: IData<OperationType>, ...p: IData[]) => {
      return executeOperation(
        operationToListItem("call", data),
        p[0],
        p.slice(1)
      );
    },
  },
];

export const builtInOperations: OperationListItem[] = [
  ...undefinedOperations,
  ...stringOperations,
  ...numberOperations,
  ...booleanOperations,
  ...arrayOperations,
  ...objectOperations,
  ...operationOperations,
  ...unknownOperations,
];

function mapArrayParameters(
  data: IData<ArrayType>,
  operation: IData<OperationType>
): IData[] {
  return data.value.map((item, index) => {
    // Get the actual data for this array item
    const itemData = getStatementResult(item);

    // Create parameter values: [item, index, array]
    const paramValues = [
      itemData,
      createData({ type: { kind: "number" }, value: index }),
      data,
    ];

    const foundOp = builtInOperations.find(
      (op) => op.name === operation.value.name
    );

    if (foundOp) {
      return executeOperation(foundOp, paramValues[0], paramValues.slice(1));
    }

    return (
      operation.value.result || createData({ type: { kind: "undefined" } })
    );
  });
}

function operationToListItem(name: string, operation: IData<OperationType>) {
  return {
    name: name ?? operation.value.name,
    parameters: operation.type.parameters,
    statements: operation.value.statements,
    result: operation.type.result,
  } as OperationListItem;
}

function createParamData(item: Parameter, data: IData): IStatement["data"] {
  if (item.type.kind !== "operation") {
    return createData({
      type: item.type || data.type,
      isTypeEditable: item.isTypeEditable,
    });
  }

  const parameters = item.type.parameters.reduce((prev, paramSpec) => {
    prev.push(
      createStatement({
        name: paramSpec.name ?? createVariableName({ prefix: "param", prev }),
        data: createParamData({ type: paramSpec.type }, data),
      })
    );
    return prev;
  }, [] as IStatement[]);

  return createData({
    type: {
      kind: "operation",
      parameters: parameters.map((p) => ({ name: p.name, type: p.data.type })),
      result: { kind: "undefined" },
    },
    value: { parameters: parameters, statements: [] },
  });
}

export function getFilteredOperations(
  data: IData,
  variables: Context["variables"]
) {
  const builtInOps = builtInOperations.filter((operation) => {
    const operationParameters = getOperationListItemParameters(operation, data);
    const firstParam = operationParameters[0]?.type ?? { kind: "undefined" };
    return firstParam.kind === "unknown" || firstParam.kind === data.type.kind;
  });

  const userDefinedOps = variables.entries().reduce((acc, [name, variable]) => {
    if (!name || !isDataOfType(variable, "operation")) return acc;
    const firstParam = variable.type.parameters[0]?.type ?? {
      kind: "undefined",
    };
    if (firstParam.kind !== "unknown" && firstParam.kind !== data.type.kind) {
      return acc;
    }
    acc.push(operationToListItem(name, variable));
    return acc;
  }, [] as OperationListItem[]);

  return [...builtInOps, ...userDefinedOps];
}

export function createOperationCall({
  data,
  name,
  parameters,
  context,
}: {
  data: IData;
  name?: string;
  parameters?: IStatement[];
  context: Context;
}): IData<OperationType> {
  const operations = getFilteredOperations(data, context.variables);
  const operationByName = operations.find(
    (operation) => operation.name === name
  );
  const newOperation = operationByName || operations[0];
  const operationParameters = getOperationListItemParameters(
    newOperation,
    data
  );
  const newParameters = operationParameters.slice(1).map((item, index) => {
    const newParam = createStatement({ data: createParamData(item, data) });
    const prevParam = parameters?.[index];
    if (
      prevParam &&
      isTypeCompatible(newParam.data.type, prevParam.data.type) &&
      isTypeCompatible(newParam.data.type, getStatementResult(prevParam).type)
    ) {
      return prevParam;
    }
    return newParam;
  });
  const result = executeOperation(
    newOperation,
    data,
    newParameters.map((p) => getStatementResult(p))
  );

  return {
    id: nanoid(),
    entityType: "data",
    type: {
      kind: "operation",
      parameters: operationParameters,
      result: result.type,
    },
    value: {
      name: newOperation.name,
      parameters: newParameters,
      statements: [],
      result: { ...result, isTypeEditable: data.isTypeEditable },
    },
  };
}

export function getOperationListItemParameters(
  operationListItem: OperationListItem,
  data: IData
) {
  return typeof operationListItem.parameters === "function"
    ? operationListItem.parameters(data)
    : operationListItem.parameters;
}
