import { nanoid } from "nanoid";
import {
  IData,
  IStatement,
  DataType,
  OperationType,
  StringType,
  ArrayType,
  NumberType,
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
} & ({ handler: (...args: IData[]) => IData } | { statements: IStatement[] });

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
      let rev = data.value > p1.value;
      let [start, end] = rev ? [p1.value, data.value] : [data.value, p1.value];
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
      let value = mapArrayParameters(data, operation);
      let foundData = data.value.find((_, i) => {
        let val = value[i];
        return val.entityType === "data" ? val.value : true;
      })?.data as IData;
      return createData({
        type: foundData?.type || { kind: "string" },
        value: foundData?.value || "",
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

    // Check if the operation is user-defined (has statements) or built-in
    if (operation.value.statements && operation.value.statements.length > 0) {
      // User-defined operation: execute statements with parameter mapping
      const paramMapping = new Map<string, IData>();

      // Map parameters to their values
      operation.type.parameters.forEach((param, i) => {
        if (param.name && paramValues[i]) {
          paramMapping.set(param.name, paramValues[i]);
        }
      });

      // Execute statements sequentially
      let lastResult: IData = createData({ type: { kind: "undefined" } });
      const stmtResults = new Map<string, IData>();

      for (const statement of operation.value.statements) {
        const result = executeStatementWithContext(
          statement,
          paramMapping,
          stmtResults
        );

        if (statement.name) {
          stmtResults.set(statement.name, result);
        }
        lastResult = result;
      }

      return lastResult;
    } else if (operation.value.result) {
      // Built-in operation or operation with cached result
      return operation.value.result;
    }

    return createData({ type: { kind: "undefined" } });
  });
}

export function executeOperation(
  operation: OperationListItem,
  data: IData,
  parameters: IData[]
): IData {
  if ("handler" in operation) return operation.handler(data, ...parameters);

  if ("statements" in operation && operation.statements.length > 0) {
    // Create parameter mapping: first parameter is the data being operated on
    const paramMapping = new Map<string, IData>();

    // Map the first parameter (the data being operated on)
    if (operation.parameters[0]?.name) {
      paramMapping.set(operation.parameters[0].name, data);
    }

    // Map remaining parameters to provided arguments
    operation.parameters.slice(1).forEach((param, index) => {
      if (param.name && parameters[index]) {
        paramMapping.set(param.name, parameters[index]);
      }
    });

    // Execute statements sequentially
    let lastResult: IData = createData({ type: { kind: "undefined" } });
    const stmtResults = new Map<string, IData>();

    for (const statement of operation.statements) {
      // Resolve statement with parameter context
      const result = executeStatementWithContext(
        statement,
        paramMapping,
        stmtResults
      );

      if (statement.name) {
        stmtResults.set(statement.name, result);
      }
      lastResult = result;
    }

    return lastResult;
  }

  return createData({ type: { kind: "undefined" } });
}

function executeStatementWithContext(
  statement: IStatement,
  paramMapping: Map<string, IData>,
  stmtResults: Map<string, IData>
): IData {
  // If this statement references a parameter or previous statement, use that value
  if (statement.data.reference?.name) {
    const refName = statement.data.reference.name;
    const paramValue = paramMapping.get(refName);
    if (paramValue) {
      // Apply any operations on top of the parameter value
      return applyOperations(
        paramValue,
        statement.operations,
        paramMapping,
        stmtResults
      );
    }
    const stmtValue = stmtResults.get(refName);
    if (stmtValue) {
      return applyOperations(
        stmtValue,
        statement.operations,
        paramMapping,
        stmtResults
      );
    }
  }

  // Execute the statement's data and operations normally
  let currentData = statement.data;
  return applyOperations(
    currentData,
    statement.operations,
    paramMapping,
    stmtResults
  );
}

function applyOperations(
  data: IData,
  operations: IData<OperationType>[],
  paramMapping: Map<string, IData>,
  stmtResults: Map<string, IData>
): IData {
  let result = data;

  for (const operation of operations) {
    // Resolve parameters for this operation
    const resolvedParams = operation.value.parameters.map((param) => {
      if (param.data.reference?.name) {
        return (
          paramMapping.get(param.data.reference.name) ||
          stmtResults.get(param.data.reference.name) ||
          getStatementResult(param)
        );
      }
      return getStatementResult(param);
    });

    // Find and execute the operation
    const foundOp = builtInOperations.find(
      (op) => op.name === operation.value.name
    );
    if (foundOp && "handler" in foundOp && foundOp.handler) {
      result = foundOp.handler(result, ...resolvedParams);
    } else if (operation.value.result) {
      result = operation.value.result;
    }
  }

  return result;
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

export function getFilteredOperations(
  data: IData,
  prevStatements: IStatement[]
) {
  const builtInOps = builtInOperations.filter((operation) =>
    isTypeCompatible(
      operation.parameters[0]?.type || { kind: "undefined" },
      data.type
    )
  );

  const userDefinedOps = prevStatements
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
  prevParams,
  prevStatements = [],
}: {
  data: IData;
  name?: string;
  prevParams?: IStatement[];
  prevStatements?: IStatement[];
}): IData<OperationType> {
  let operations = getFilteredOperations(data, prevStatements);
  let operationByName = operations.find((operation) => operation.name === name);
  let newOperation = operationByName || operations[0];

  let parameters = newOperation.parameters.slice(1).map((item, index) => {
    const newParam = createStatement({ data: createParamData(item, data) });
    const prevParam = prevParams?.[index];
    if (
      prevParam &&
      isTypeCompatible(newParam.data.type, prevParam.data.type) &&
      isTypeCompatible(newParam.data.type, getStatementResult(prevParam).type)
    ) {
      return prevParam;
    }
    return newParam;
  });
  let result = executeOperation(
    newOperation,
    data,
    parameters.map((p) => getStatementResult(p))
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
      parameters,
      statements: [],
      result: { ...result, isGeneric: data.isGeneric },
    },
  };
}
