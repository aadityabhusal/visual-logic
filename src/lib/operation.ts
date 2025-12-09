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
  OperationListItem,
  ExecutionContext,
} from "./types";
import {
  createData,
  createStatement,
  createParamData,
  getStatementResult,
  inferTypeFromValue,
  isDataOfType,
  isTypeCompatible,
  resolveUnionType,
} from "./utils";

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
  // TODO: add typeOf operation for unknown type here. Or maybe separate operations accepting 'unknown' and 'any' type.
];

const unionOperations: OperationListItem[] = [
  {
    name: "typeOf",
    parameters: (data) => [
      { type: { kind: "union", types: [] } },
      { type: data.type },
    ],
    result: { kind: "boolean" },
    handler: (data: IData<UnknownType>, typeData: IData) => {
      return createData({
        type: { kind: "boolean" },
        value: isTypeCompatible(
          inferTypeFromValue(data.value),
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

const arrayOperations: OperationListItem[] = [
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
    name: "length",
    parameters: [{ type: { kind: "array", elementType: { kind: "unknown" } } }],
    result: { kind: "number" },
    handler: (data: IData<ArrayType>) => {
      return createData({ type: { kind: "number" }, value: data.value.length });
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
          elementType: resolveUnionType(value.map((item) => item.type)),
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
    result: (data) => data.type,
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

const objectOperations: OperationListItem[] = [
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
    result: (data) =>
      isDataOfType(data, "object")
        ? {
            kind: "array",
            elementType: resolveUnionType(Object.values(data.type.properties)),
          }
        : { kind: "undefined" },
    handler(data: IData<ObjectType>) {
      return createData({
        type: {
          kind: "array",
          elementType: resolveUnionType(Object.values(data.type.properties)),
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
  ...unionOperations,
];

function mapArrayParameters(
  data: IData<ArrayType>,
  operation: IData<OperationType>
): IData[] {
  return data.value.map((item, index) => {
    const itemData = getStatementResult(item);
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

/* Operation List */

function operationToListItem(name: string, operation: IData<OperationType>) {
  return {
    name: name ?? operation.value.name,
    parameters: operation.type.parameters,
    statements: operation.value.statements,
    result: operation.type.result,
  } as OperationListItem;
}

export function getFilteredOperations(
  data: IData,
  variables: Context["variables"]
) {
  const supportsOperation = (data: DataType, firstParam: DataType) => {
    if (data.kind === "never") return false;
    return data.kind === "union" && firstParam.kind !== "union"
      ? data.types.every((t) => t.kind === firstParam.kind)
      : data.kind === firstParam.kind || firstParam.kind === "unknown";
  };
  const builtInOps = builtInOperations.filter((operation) => {
    const operationParameters = getOperationListItemParameters(operation, data);
    const firstParam = operationParameters[0]?.type ?? { kind: "undefined" };
    return supportsOperation(data.type, firstParam);
  });

  const userDefinedOps = variables.entries().reduce((acc, [name, variable]) => {
    if (!name || !isDataOfType(variable, "operation")) return acc;
    const firstParam = variable.type.parameters[0]?.type ?? {
      kind: "undefined",
    };
    if (supportsOperation(data.type, firstParam)) {
      acc.push(operationToListItem(name, variable));
    }
    return acc;
  }, [] as OperationListItem[]);

  return [...builtInOps, ...userDefinedOps];
}

export function getOperationListItemParameters(
  operationListItem: OperationListItem,
  data: IData
) {
  return typeof operationListItem.parameters === "function"
    ? operationListItem.parameters(data)
    : operationListItem.parameters;
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

/* Execution */

function buildExecutionContext(
  operation: OperationListItem,
  data: IData,
  parameters: IData[]
): ExecutionContext {
  const context = { parameters: new Map(), statements: new Map() };
  const operationListItemParams = getOperationListItemParameters(
    operation,
    data
  );
  if (operationListItemParams[0]?.name) {
    context.parameters.set(operationListItemParams[0].name, data);
  }
  operationListItemParams.slice(1).forEach((param, index) => {
    if (param.name && parameters[index]) {
      context.parameters.set(param.name, parameters[index]);
    }
  });
  return context;
}

function executeStatement(
  statement: IStatement,
  context: ExecutionContext
): IData {
  let currentData = statement.data;
  if (statement.data.reference) {
    const refName = statement.data.reference.name;
    currentData =
      context.parameters.get(refName) ||
      context.statements.get(refName) ||
      statement.data;
  }
  if (isDataOfType(currentData, "condition")) {
    const conditionValue = currentData.value;
    const conditionResult = executeStatement(conditionValue.condition, context);
    currentData = executeStatement(
      conditionResult.value ? conditionValue.true : conditionValue.false,
      context
    );
  }
  // Apply operation chain to the resolved data
  let result = currentData;
  for (const operation of statement.operations) {
    const resolvedParams = operation.value.parameters.map((param) => {
      if (param.data.reference) {
        return (
          context.parameters.get(param.data.reference.name) ||
          context.statements.get(param.data.reference.name) ||
          getStatementResult(param)
        );
      }
      return getStatementResult(param);
    });
    const foundOp = builtInOperations.find(
      (op) => op.name === operation.value.name
    );
    if (foundOp && "handler" in foundOp) {
      result = foundOp.handler(result, ...resolvedParams);
    } else if (operation.value.result) {
      result = operation.value.result;
    }
  }
  return result;
}

export function executeOperation(
  operation: OperationListItem,
  data: IData,
  parameters: IData[]
): IData {
  if ("handler" in operation) return operation.handler(data, ...parameters);
  if ("statements" in operation && operation.statements.length > 0) {
    const context = buildExecutionContext(operation, data, parameters);
    let lastResult: IData = createData({ type: { kind: "undefined" } });
    for (const statement of operation.statements) {
      lastResult = executeStatement(statement, context);
      if (statement.name) context.statements.set(statement.name, lastResult);
    }
    return lastResult;
  }
  return createData({ type: { kind: "undefined" } });
}
