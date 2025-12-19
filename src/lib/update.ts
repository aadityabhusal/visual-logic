import { getFilteredOperations, executeOperation } from "./operation";
import { IStatement, IData, OperationType, Context } from "./types";
import {
  getStatementResult,
  isDataOfType,
  inferTypeFromValue,
  createContextVariables,
  createStatement,
} from "./utils";

export function updateOperationCalls(
  statement: IStatement,
  context: Context
): IData<OperationType>[] {
  return statement.operations.reduce(
    (previousOperations, currentOperation, index) => {
      const data = getStatementResult(
        { ...statement, operations: previousOperations },
        index
      );
      const parameters = updateStatements({
        statements: currentOperation.value.parameters,
        context,
      });
      const paramResults = parameters.map((item) => {
        return getStatementResult(item);
      });

      const foundOperation = getFilteredOperations(
        data,
        context.variables
      ).find((operation) => operation.name === currentOperation.value.name);
      const currentResult = currentOperation.value.result;
      const result = foundOperation
        ? {
            ...executeOperation(foundOperation, data, paramResults, context),
            ...(currentResult && { id: currentResult?.id }),
            isTypeEditable: data.isTypeEditable,
          }
        : currentResult;

      return [
        ...previousOperations,
        {
          ...currentOperation,
          value: { ...currentOperation.value, parameters, result },
        },
      ];
    },
    [] as IData<OperationType>[]
  );
}

function updateStatementReference(
  currentStatement: IStatement,
  context: Context
): IStatement {
  const currentReference = isDataOfType(currentStatement.data, "reference")
    ? currentStatement.data.value
    : undefined;
  const foundReference = context.variables
    .entries()
    .find(([, item]) => item.data?.id === currentReference?.id);
  const reference = foundReference
    ? { name: foundReference[0], data: foundReference[1].data }
    : undefined;

  return {
    ...currentStatement,
    data: reference
      ? {
          ...currentStatement.data,
          type: { kind: "reference", dataType: reference.data.type },
          value: { name: reference.name, id: reference.data.id },
        }
      : currentStatement.data,
    operations: updateOperationCalls(currentStatement, context),
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
    let statementToProcess = currentStatement;
    if (currentStatement.id === changedStatement?.id) {
      currentIndexFound = true;
      if (removeStatement) return prevStatements;
      statementToProcess = changedStatement;
    }

    if (changedStatement && !currentIndexFound)
      return [...prevStatements, currentStatement];

    const _context = {
      currentStatementId: statementToProcess.id,
      variables: createContextVariables(
        prevStatements,
        new Map(context.variables)
      ),
    };
    return [
      ...prevStatements,
      updateStatementReference(statementToProcess, _context),
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
        variables: createContextVariables(
          prevOperations.map((data) => createStatement({ data })),
          new Map()
        ),
      },
    });
    const parameterLength = currentOperation.value.parameters.length;
    const parameters = updatedStatements.slice(0, parameterLength);
    const statements = updatedStatements.slice(parameterLength);
    return [
      ...prevOperations,
      {
        ...currentOperation,
        type: inferTypeFromValue({ parameters, statements }),
        value: { ...currentOperation.value, parameters, statements },
      },
    ];
  }, [] as IData<OperationType>[]);
}
