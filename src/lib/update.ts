import { executeOperation } from "./execution";
import { getFilteredOperations } from "./methods";
import { IStatement, IData, OperationType, Context } from "./types";
import {
  createData,
  createStatement,
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
  reference?: IStatement
): IData {
  const currentReference = data.reference;
  const referenceResult = reference && getStatementResult(reference);

  const isTypeChanged =
    reference &&
    (referenceResult?.entityType !== "data" ||
      !isTypeCompatible(data.type, referenceResult?.type));
  const isReferenceRemoved =
    currentReference?.id &&
    (!reference?.name || referenceResult?.entityType !== "data");

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
      referenceResult?.entityType === "data"
        ? referenceResult?.value
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
  reference?: IStatement
): IData<OperationType> {
  const currentReference = operation.reference;
  const referenceResult = reference && getStatementResult(reference);
  const isReferenceRemoved =
    currentReference?.id &&
    (!reference?.name || isDataOfType(referenceResult, "operation"));
  const isTypeChanged = reference
    ? !isTypeCompatible(operation.type, reference.data.type)
    : true;

  let parameterList = operation.value.parameters;
  let statementList = operation.value.statements;
  // TODO: handle closure with execution context
  // let closure = operation.closure;
  if (reference && isDataOfType(referenceResult, "operation")) {
    parameterList = referenceResult.value.parameters;
    statementList = referenceResult.value.statements;
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
          if (param.name) acc[param.name] = param;
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
  const reference = Object.values(context.variables).find(
    (item) => item.id === currentReference?.id
  );

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
        if (stmt.name) acc[stmt.name] = stmt;
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
          const statement = createStatement({
            data: operation,
            name: operation.value.name,
            id: operation.id,
          });
          if (statement.name) acc[statement.name] = statement;
          return acc;
        }, {} as { [key: string]: IStatement }),
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
