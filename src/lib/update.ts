import { executeOperation } from "./execution";
import { getFilteredOperations } from "./methods";
import { IStatement, IData, OperationType, Context } from "./types";
import {
  createData,
  getStatementResult,
  isDataOfType,
  isTypeCompatible,
  resetParameters,
  getOperationType,
  getConditionResult,
} from "./utils";

export function updateOperationCalls(
  statement: IStatement,
  context: Context
): IStatement {
  const updatedOperations = statement.operations.reduce(
    (previousOperations, currentOperation, index) => {
      const data = getStatementResult(
        { ...statement, operations: previousOperations },
        index
      );
      const parameters = currentOperation.value.parameters.map((item) => {
        // let closure = item.data.entityType === "operation" && {
        //   closure: [...item.data.closure, ...previous],
        // };
        return getStatementResult({
          ...item,
          data: { ...item.data /* ...closure */ },
        });
      });

      const foundOperation = getFilteredOperations(data, context).find(
        (operation) => operation.name === currentOperation.value.name
      );
      const currentResult = currentOperation.value.result;
      const result = foundOperation
        ? {
            ...executeOperation(foundOperation, data, parameters),
            ...(currentResult && { id: currentResult?.id }),
            isGeneric: data.isTypeEditable,
          }
        : currentResult;

      return [
        ...previousOperations,
        { ...currentOperation, value: { ...currentOperation.value, result } },
      ];
    },
    [] as IData<OperationType>[]
  );
  return { ...statement, operations: updatedOperations };
}

function getReferenceData(
  data: IData,
  context: Context,
  reference?: { name: string; data: IData }
): IData {
  const currentReference = data.reference;

  const isTypeChanged =
    reference &&
    (reference?.data.entityType !== "data" ||
      !isTypeCompatible(data.type, reference?.data.type));
  const isReferenceRemoved =
    currentReference?.id &&
    (!reference?.name || reference?.data.entityType !== "data");

  const { id: _id, ...newData } = createData({
    type: data.type,
    isTypeEditable: data.isTypeEditable,
  });

  return {
    ...data,
    reference:
      reference?.name && currentReference
        ? { ...currentReference, name: reference?.name }
        : undefined,
    value:
      reference?.data.entityType === "data"
        ? reference?.data.value
        : Array.isArray(data.value)
        ? updateStatements({ statements: data.value, context })
        : data.value instanceof Map
        ? new Map(
            [...data.value.entries()].map(([name, value]) => [
              name,
              updateStatements({ statements: [value], context })[0],
            ])
          )
        : isDataOfType(data, "condition")
        ? (() => {
            const condition = updateStatements({
              statements: [data.value.condition],
              context,
            })[0];
            const _true = updateStatements({
              statements: [data.value.true],
              context,
            })[0];
            const _false = updateStatements({
              statements: [data.value.false],
              context,
            })[0];
            const result = getConditionResult({
              condition,
              true: _true,
              false: _false,
            });
            return { condition, true: _true, false: _false, result };
          })()
        : data.value,
    ...((isReferenceRemoved || isTypeChanged) && newData),
  };
}

export function getReferenceOperation(
  operation: IData<OperationType>,
  context: Context,
  reference?: { name: string; data: IData }
): IData<OperationType> {
  const currentReference = operation.reference;
  const isReferenceRemoved =
    currentReference?.id &&
    (!reference?.name || isDataOfType(reference.data, "operation"));
  const isTypeChanged = reference
    ? !isTypeCompatible(operation.type, reference.data.type)
    : true;

  let parameterList = operation.value.parameters;
  let statementList = operation.value.statements;
  // TODO: handle closure with execution context
  // let closure = operation.closure;
  if (reference && isDataOfType(reference.data, "operation")) {
    parameterList = reference.data.value.parameters;
    statementList = reference.data.value.statements;
    // closure = getClosureList(reference) || closure;
  }

  const updatedParameters = parameterList.map((parameter) => {
    let argument = operation.value.parameters?.find(
      (item) => item.id === parameter.id
    );
    if (argument) {
      if (
        !isTypeCompatible(
          parameter.data.type,
          getStatementResult(argument).type
        )
      ) {
        if (isDataOfType(argument.data, "operation")) {
          const params = isDataOfType(parameter.data, "operation")
            ? parameter.data.value.parameters
            : argument.data.value.parameters;
          argument = {
            ...argument,
            data: {
              ...argument.data,
              value: {
                ...argument.data.value,
                parameters: resetParameters(
                  params,
                  argument.data.value.parameters
                ),
              },
            },
          };
        } else {
          argument = { ...argument, data: parameter.data };
        }
      }
      return updateStatements({ statements: [argument], context })[0];
    }
    return { ...parameter, data: { ...parameter.data, isTypeEditable: false } };
  });

  const updatedStatements = updateStatements({
    statements: statementList,
    context: {
      ...context,
      variables: {
        ...updatedParameters.reduce((acc, param) => {
          if (param.name) acc[param.name] = getStatementResult(param);
          return acc;
        }, context.variables),
      },
    },
  });

  const finalParameters = isTypeChanged
    ? resetParameters(updatedParameters, operation.value.parameters)
    : updatedParameters;

  return {
    ...operation,
    type: getOperationType(finalParameters, updatedStatements),
    value: {
      ...operation.value,
      parameters: finalParameters,
      statements: updatedStatements,
    },
    reference:
      reference?.name && currentReference && !isReferenceRemoved
        ? { ...currentReference, name: reference?.name }
        : undefined,
    // closure,
  };
}

export function updateStatementReference(
  currentStatement: IStatement,
  context: Context
): IStatement {
  const currentReference = currentStatement.data.reference;
  const foundReference = Object.entries(context.variables).find(
    ([, item]) => item.reference?.id === currentReference?.id
  );
  const reference = foundReference
    ? { name: foundReference[0], data: foundReference[1] }
    : undefined;

  return {
    ...currentStatement,
    data: isDataOfType(currentStatement.data, "operation")
      ? getReferenceOperation(currentStatement.data, context, reference)
      : getReferenceData(currentStatement.data, context, reference),
    operations: currentStatement.operations.map((operation) => {
      const updatedParameters = updateStatements({
        statements: operation.value.parameters,
        context,
      });
      // For operation calls, preserve the result type from the definition
      // Only update parameter types
      return {
        ...operation,
        type: {
          ...operation.type,
          parameters: updatedParameters.map((param) => ({
            name: param.name,
            type: param.data.type,
          })),
        },
        value: {
          ...operation.value,
          parameters: updatedParameters,
        },
      };
    }),
  };
}

export function updateStatements({
  statements,
  changedStatement,
  removeStatement,
  context,
}: {
  statements: IStatement[];
  changedStatement?: IStatement;
  removeStatement?: boolean;
  context: Context;
}): IStatement[] {
  let currentIndexFound = false;
  const foundRef = Object.entries(context.variables).find(
    ([, item]) => item.reference?.id === changedStatement?.id
  );
  if (foundRef) delete context.variables[foundRef[0]];
  return statements.reduce((prevStatements, currentStatement) => {
    if (currentStatement.id === changedStatement?.id) {
      currentIndexFound = true;
      if (removeStatement) return prevStatements;
      else return [...prevStatements, changedStatement];
    }

    if (changedStatement && !currentIndexFound)
      return [...prevStatements, currentStatement];

    const _context = {
      ...context,
      variables: prevStatements.reduce((acc, stmt) => {
        if (stmt.name) acc[stmt.name] = getStatementResult(stmt);
        return acc;
      }, context.variables),
    };
    return [
      ...prevStatements,
      updateOperationCalls(
        updateStatementReference(currentStatement, _context),
        _context
      ),
    ];
  }, [] as IStatement[]);
}

export function updateOperations(
  operations: IData<OperationType>[],
  changedOperation: IData<OperationType>,
  removeOperation?: boolean
): IData<OperationType>[] {
  let currentIndexFound = false;
  return operations.reduce((prevOperations, currentOperation) => {
    if (currentOperation.id === changedOperation.id) {
      currentIndexFound = true;
      if (removeOperation) return prevOperations;
      else return [...prevOperations, changedOperation];
    }

    if (!currentIndexFound) return [...prevOperations, currentOperation];

    const updatedStatements = updateStatements({
      statements: [
        ...currentOperation.value.parameters,
        ...currentOperation.value.statements,
      ],
      context: {
        variables: prevOperations.reduce((acc, operation) => {
          if (operation.value.name) acc[operation.value.name] = operation;
          return acc;
        }, {} as Context["variables"]),
      },
    });
    const parameterLength = currentOperation.value.parameters.length;
    const parameters = updatedStatements.slice(0, parameterLength);
    const statements = updatedStatements.slice(parameterLength);
    return [
      ...prevOperations,
      {
        ...currentOperation,
        type: getOperationType(parameters, statements),
        value: { ...currentOperation.value, parameters, statements },
      },
    ];
  }, [] as IData<OperationType>[]);
}
