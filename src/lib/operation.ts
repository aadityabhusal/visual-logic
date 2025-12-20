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
  Parameter,
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
  resolveReference,
} from "./utils";

const unknownOperations: OperationListItem[] = [
  {
    name: "isEqual",
    parameters: (data) => [{ type: { kind: "unknown" } }, { type: data.type }],
    handler: (_, data: IData, p1: IData) => {
      return createData({
        type: { kind: "boolean" },
        value: JSON.stringify(data.value) === JSON.stringify(p1.value),
      });
    },
  },
  {
    name: "toString",
    parameters: [{ type: { kind: "unknown" } }],
    handler: (_, data: IData<StringType>) => {
      return createData({
        type: { kind: "string" },
        value: String(data.value),
      });
    },
  },
  // TODO: add isTypeOf operation for unknown type here. Or maybe separate operations accepting 'unknown' and 'any' type.
];

const unionOperations: OperationListItem[] = [
  {
    name: "isTypeOf",
    parameters: (data) => [
      { type: { kind: "union", types: [] } },
      { type: data.type },
    ],
    handler: (_, data: IData<UnknownType>, typeData: IData) => {
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

const undefinedOperations: OperationListItem[] = [];

const booleanOperations: OperationListItem[] = [
  {
    name: "and",
    parameters: [
      { type: { kind: "boolean" } },
      { type: { kind: "undefined" }, isTypeEditable: true },
    ],
    handler: (_, data: IData<BooleanType>, p1: IData) => {
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
    handler: (_, data: IData<UnknownType>, p1: IData) => {
      return createData({
        type: { kind: "boolean" },
        value: Boolean(data.value) || Boolean(p1.value),
      });
    },
  },
  {
    name: "not",
    parameters: [{ type: { kind: "boolean" } }],
    handler: (_, data: IData<BooleanType>) => {
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
    handler: (_, data: IData<BooleanType>, p1: IData, p2: IData) => {
      const value = data.value ? p1.value : p2.value;
      return createData({ type: inferTypeFromValue(value), value });
    },
  },
];

const stringOperations: OperationListItem[] = [
  {
    name: "getLength",
    parameters: [{ type: { kind: "string" } }],
    handler: (_, data: IData<StringType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value.length,
      });
    },
  },
  {
    name: "concat",
    parameters: [{ type: { kind: "string" } }, { type: { kind: "string" } }],
    handler: (_, data: IData<StringType>, p1: IData<StringType>) => {
      return createData({
        type: { kind: "string" },
        value: data.value.concat(p1.value),
      });
    },
  },
  {
    name: "includes",
    parameters: [{ type: { kind: "string" } }, { type: { kind: "string" } }],
    handler: (_, data: IData<StringType>, p1: IData<StringType>) => {
      return createData({
        type: { kind: "boolean" },
        value: data.value.includes(p1.value),
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
    handler: (
      _,
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
    handler: (_, data: IData<StringType>, p1: IData<StringType>) => {
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
  {
    name: "toUpperCase",
    parameters: [{ type: { kind: "string" } }],
    handler: (_, data: IData<StringType>) => {
      return createData({
        type: { kind: "string" },
        value: data.value.toUpperCase(),
      });
    },
  },
  {
    name: "toLowerCase",
    parameters: [{ type: { kind: "string" } }],
    handler: (_, data: IData<StringType>) => {
      return createData({
        type: { kind: "string" },
        value: data.value.toLowerCase(),
      });
    },
  },
];

const numberOperations: OperationListItem[] = [
  {
    name: "add",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value + p1.value,
      });
    },
  },
  {
    name: "subtract",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value - p1.value,
      });
    },
  },
  {
    name: "multiply",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value * p1.value,
      });
    },
  },
  {
    name: "divide",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value / p1.value,
      });
    },
  },
  {
    name: "power",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: Math.pow(data.value, p1.value),
      });
    },
  },
  {
    name: "mod",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<NumberType>) => {
      return createData({
        type: { kind: "number" },
        value: data.value % p1.value,
      });
    },
  },
  {
    name: "lessThan",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<typeof data.type>) =>
      createData({ type: { kind: "boolean" }, value: data.value < p1.value }),
  },
  {
    name: "lessThanOrEqual",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<typeof data.type>) =>
      createData({ type: { kind: "boolean" }, value: data.value <= p1.value }),
  },
  {
    name: "greaterThan",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<typeof data.type>) =>
      createData({ type: { kind: "boolean" }, value: data.value > p1.value }),
  },
  {
    name: "greaterThanOrEqual",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<typeof data.type>) =>
      createData({ type: { kind: "boolean" }, value: data.value >= p1.value }),
  },
  {
    name: "toRange",
    parameters: [{ type: { kind: "number" } }, { type: { kind: "number" } }],
    handler: (_, data: IData<NumberType>, p1: IData<NumberType>) => {
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
    name: "get",
    parameters: [
      { type: { kind: "array", elementType: { kind: "unknown" } } },
      { type: { kind: "number" } },
    ],
    handler: (_, data: IData<ArrayType>, p1: IData<NumberType>) => {
      const item = data.value.at(p1.value);
      if (!item) return createData({ type: { kind: "undefined" } });
      const value = getStatementResult(item) as IData;
      return createData({ type: value.type, value: value.value });
    },
  },
  {
    name: "getLength",
    parameters: [{ type: { kind: "array", elementType: { kind: "unknown" } } }],
    handler: (_, data: IData<ArrayType>) => {
      return createData({ type: { kind: "number" }, value: data.value.length });
    },
  },
  {
    name: "map",
    parameters: getArrayCallbackParameters,
    handler: (
      context,
      data: IData<ArrayType>,
      operation: IData<OperationType>
    ) => {
      const results = executeArrayOperation(data, operation, context);
      return createData({
        type: {
          kind: "array",
          elementType: resolveUnionType(results.map((r) => r.type)),
        },
        value: results.map((r) => createStatement({ data: r })),
      });
    },
  },
  {
    name: "find",
    parameters: getArrayCallbackParameters,
    handler: (
      context,
      data: IData<ArrayType>,
      operation: IData<OperationType>
    ) => {
      const results = executeArrayOperation(data, operation, context);
      const found = results.find((r) => Boolean(r.value));
      return createData({
        type: found?.type ?? { kind: "undefined" },
        value: found?.value ?? undefined,
      });
    },
  },
  {
    name: "filter",
    parameters: getArrayCallbackParameters,
    handler: (
      context,
      data: IData<ArrayType>,
      operation: IData<OperationType>
    ) => {
      const results = executeArrayOperation(data, operation, context);
      const filtered = data.value.filter((_, i) => Boolean(results[i].value));
      return createData({ type: data.type, value: filtered });
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
    handler(_, data: IData<ObjectType>, p1: IData<StringType>) {
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
    handler(_, data: IData<ObjectType>, p1: IData<StringType>) {
      return createData({
        type: { kind: "boolean" },
        value: data.value.has(p1.value),
      });
    },
  },
  {
    name: "keys",
    parameters: [{ type: { kind: "object", properties: {} } }],
    handler(_, data: IData<ObjectType>) {
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
    handler(_, data: IData<ObjectType>) {
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
    handler: (context, data: IData<OperationType>, ...p: IData[]) => {
      return executeOperation(
        operationToListItem("call", data),
        p[0],
        p.slice(1),
        context
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

function executeArrayOperation(
  data: IData<ArrayType>,
  operation: IData<OperationType>,
  context: Context
): IData[] {
  return data.value.map((item, index) => {
    const itemData = getStatementResult(item);
    return executeOperation(
      operationToListItem("anonymous", operation),
      itemData,
      [createData({ type: { kind: "number" }, value: index }), data],
      context
    );
  });
}

function getArrayCallbackParameters(data: IData) {
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
  ] as Parameter[];
}

/* Operation List */

function operationToListItem(name: string, operation: IData<OperationType>) {
  return {
    name: name ?? operation.value.name,
    parameters: operation.type.parameters,
    statements: operation.value.statements,
  } as OperationListItem;
}

export function getFilteredOperations(
  _data: IData,
  variables: Context["variables"]
) {
  const data = resolveReference(_data, { variables });
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
    if (!name || !isDataOfType(variable.data, "operation")) return acc;
    const firstParam = variable.data.type.parameters[0]?.type ?? {
      kind: "undefined",
    };
    if (supportsOperation(data.type, firstParam)) {
      acc.push(operationToListItem(name, variable.data));
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
  data: _data,
  name,
  parameters,
  context,
}: {
  data: IData;
  name?: string;
  parameters?: IStatement[];
  context: Context;
}): IData<OperationType> {
  const data = resolveReference(_data, context);
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
    newParameters.map((p) => getStatementResult(p)),
    context
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
  parameters: IData[],
  prevContext: Context
): Context {
  const context = { variables: new Map(prevContext.variables) };
  const operationListItemParams = getOperationListItemParameters(
    operation,
    data
  );
  if (operationListItemParams[0]?.name) {
    const resolved = resolveReference(data, prevContext);
    context.variables.set(operationListItemParams[0].name, {
      data: resolved,
      reference: isDataOfType(data, "reference") ? data.value : undefined,
    });
  }
  operationListItemParams.slice(1).forEach((param, index) => {
    if (param.name && parameters[index]) {
      const resolved = resolveReference(parameters[index], prevContext);
      context.variables.set(param.name, {
        data: resolved,
        reference: isDataOfType(parameters[index], "reference")
          ? parameters[index].value
          : undefined,
      });
    }
  });
  return context;
}

export function executeStatement(
  statement: IStatement,
  context: Context
): IData {
  let currentData = resolveReference(statement.data, context);
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
    const resolvedParams = operation.value.parameters.map((param) =>
      executeStatement(param, context)
    );
    const foundOp = builtInOperations.find(
      (op) => op.name === operation.value.name
    );
    if (foundOp && "handler" in foundOp) {
      result = foundOp.handler(context, result, ...resolvedParams);
    } else if (operation.value.result) {
      result = operation.value.result;
    }
  }
  return result;
}

export function executeOperation(
  operation: OperationListItem,
  _data: IData,
  parameters: IData[],
  prevContext: Context
): IData {
  const data = resolveReference(_data, prevContext);
  if ("handler" in operation)
    return operation.handler(prevContext, data, ...parameters);
  if ("statements" in operation && operation.statements.length > 0) {
    const context = buildExecutionContext(
      operation,
      data,
      parameters,
      prevContext
    );
    let lastResult: IData = createData({ type: { kind: "undefined" } });
    for (const statement of operation.statements) {
      lastResult = executeStatement(statement, context);
      if (statement.name) {
        context.variables.set(statement.name, {
          data: lastResult,
          reference: undefined,
        });
      }
    }
    return lastResult;
  }
  return createData({ type: { kind: "undefined" } });
}
