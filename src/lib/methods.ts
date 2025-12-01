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
  ConditionType,
  DataValue,
  Context,
} from "./types";
import {
  createData,
  createStatement,
  createVariableName,
  getStatementResult,
  isDataOfType,
  isTypeCompatible,
} from "./utils";

export type OperationListItem = {
  name: string;
  parameters: OperationType["parameters"];
  result: DataType;
} & ( // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { handler: (...args: IData<any>[]) => IData }
  | { statements: IStatement[] }
);

export const builtInOperations: OperationListItem[] = [
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
  {
    name: "find",
    parameters: [
      {
        type: {
          kind: "array",
          elementType: {
            kind: "union",
            types: [{ kind: "string" }, { kind: "undefined" }],
          },
        },
      },
      {
        type: {
          kind: "operation",
          parameters: [
            { name: "item", type: { kind: "string" } },
            { name: "index", type: { kind: "number" } },
            {
              name: "arr",
              type: { kind: "array", elementType: { kind: "string" } },
            },
          ],
          result: { kind: "string" },
        },
      },
    ],
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
  {
    name: "getCurrentTime",
    parameters: [],
    result: { kind: "string" },
    handler: () => {
      return createData({
        type: { kind: "string" },
        value: new Date().toISOString(),
      });
    },
  },
  {
    name: "equals",
    parameters: [{ type: { kind: "unknown" } }, { type: { kind: "unknown" } }],
    result: { kind: "boolean" },
    handler: (data: IData<UnknownType>, p1: IData<UnknownType>) => {
      return createData({
        type: { kind: "boolean" },
        value: JSON.stringify(data.value) === JSON.stringify(p1.value),
      });
    },
  },
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

type ExecutionContext = {
  parameters: Map<string, IData>;
  statements: Map<string, IData>;
};

function buildExecutionContext(
  operation: OperationListItem,
  data: IData,
  parameters: IData[]
): ExecutionContext {
  const context = { parameters: new Map(), statements: new Map() };

  // Map first parameter to the data being operated on
  if (operation.parameters[0]?.name) {
    context.parameters.set(operation.parameters[0].name, data);
  }

  // Map remaining parameters to provided arguments
  operation.parameters.slice(1).forEach((param, index) => {
    if (param.name && parameters[index]) {
      context.parameters.set(param.name, parameters[index]);
    }
  });

  return context;
}

function executeCondition(
  condition: DataValue<ConditionType>,
  context: ExecutionContext
): IData {
  const conditionResult = executeStatement(condition.condition, context);
  const conditionValue = conditionResult.value;

  const isTrue =
    conditionValue === true ||
    (typeof conditionValue === "string" && conditionValue.length > 0) ||
    (typeof conditionValue === "number" && conditionValue !== 0);

  return executeStatement(isTrue ? condition.true : condition.false, context);
}

function executeStatement(
  statement: IStatement,
  context: ExecutionContext
): IData {
  // Resolve base data (parameter reference, statement reference, or direct data)
  let currentData = statement.data;

  if (statement.data.reference?.name) {
    const refName = statement.data.reference.name;
    currentData =
      context.parameters.get(refName) ||
      context.statements.get(refName) ||
      statement.data;
  }

  if (isDataOfType(currentData, "condition")) {
    currentData = executeCondition(currentData.value, context);
  }

  // Apply operation chain to the resolved data
  let result = currentData;

  for (const operation of statement.operations) {
    // Resolve operation parameters from context
    const resolvedParams = operation.value.parameters.map((param) => {
      if (param.data.reference?.name) {
        return (
          context.parameters.get(param.data.reference.name) ||
          context.statements.get(param.data.reference.name) ||
          getStatementResult(param)
        );
      }
      return getStatementResult(param);
    });

    // Execute the operation
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

function createParamData(
  item: OperationListItem["parameters"][0],
  data: IData
): IStatement["data"] {
  if (item.type.kind !== "operation") {
    return createData({ type: item.type || data.type, isGeneric: false });
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

export function getFilteredOperations(data: IData, context: Context) {
  const builtInOps = builtInOperations.filter((operation) =>
    isTypeCompatible(
      operation.parameters[0]?.type || { kind: "undefined" },
      data.type
    )
  );

  const userDefinedOps = Object.values(context.variables)
    .filter(
      (statement) =>
        statement.name &&
        isDataOfType(statement.data, "operation") &&
        isTypeCompatible(
          statement.data.type.parameters[0]?.type || { kind: "undefined" },
          data.type
        )
    )
    .map((statement) => {
      const operation = statement.data as IData<OperationType>;
      return {
        name: statement.name!,
        parameters: operation.type.parameters,
        statements: operation.value.statements,
        result: operation.type.result,
      };
    });

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
  const operations = getFilteredOperations(data, context);
  const operationByName = operations.find(
    (operation) => operation.name === name
  );
  const newOperation = operationByName || operations[0];

  const newParameters = newOperation.parameters.slice(1).map((item, index) => {
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
      parameters: newOperation.parameters,
      result: newOperation.result,
    },
    value: {
      name: newOperation.name,
      parameters: newParameters,
      statements: [],
      result: { ...result, isGeneric: data.isGeneric },
    },
  };
}
