import {
  builtInOperations,
  getOperationListItemParameters,
  OperationListItem,
} from "./methods";
import {
  IData,
  IStatement,
  ConditionType,
  DataValue,
  ExecutionContext,
} from "./types";
import { createData, getStatementResult, isDataOfType } from "./utils";

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
  // Map first parameter to the data being operated on
  if (operationListItemParams[0]?.name) {
    context.parameters.set(operationListItemParams[0].name, data);
  }

  // Map remaining parameters to provided arguments
  operationListItemParams.slice(1).forEach((param, index) => {
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
  return executeStatement(
    conditionResult.value ? condition.true : condition.false,
    context
  );
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
