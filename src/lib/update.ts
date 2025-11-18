import { getFilteredOperations, executeOperation } from "./methods";
import { IStatement, IData, OperationType } from "./types";
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

export function updateStatementMethods(
  statement: IStatement,
  previous: IStatement[] = []
): IStatement {
  let updatedOperations = statement.operations.reduce(
    (previousOperations, currentOperation, index) => {
      let data = getStatementResult(
        { ...statement, operations: previousOperations },
        index
      );
      let parameters = currentOperation.value.parameters.map((item) => {
        // let closure = item.data.entityType === "operation" && {
        //   closure: [...item.data.closure, ...previous],
        // };
        return getStatementResult({
          ...item,
          data: { ...item.data /* ...closure */ },
        });
      });

      const foundOperation = getFilteredOperations(data, previous).find(
        (operation) => operation.name === currentOperation.value.name
      );
      const currentResult = currentOperation.value.result;
      let result = foundOperation
        ? {
            ...executeOperation(foundOperation, data, parameters),
            ...(currentResult && { id: currentResult?.id }),
            isGeneric: data.isGeneric,
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
  previous: IStatement[],
  reference?: IStatement
): IData {
  const currentReference = data.reference;
  let referenceResult = reference && getStatementResult(reference);

  const isTypeChanged =
    reference &&
    (referenceResult?.entityType !== "data" ||
      !isTypeCompatible(data.type, referenceResult?.type));
  const isReferenceRemoved =
    currentReference?.id &&
    (!reference?.name || referenceResult?.entityType !== "data");

  const { id: newId, ...newData } = createData({
    type: data.type,
    isGeneric: data.isGeneric,
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
        ? updateStatements({ statements: data.value, previous })
        : data.value instanceof Map
        ? new Map(
            [...data.value.entries()].map(([name, value]) => [
              name,
              updateStatements({ statements: [value], previous })[0],
            ])
          )
        : isDataOfType(data, "condition")
        ? (() => {
            const condition = updateStatements({
              statements: [data.value.condition],
              previous,
            })[0];
            const _true = updateStatements({
              statements: [data.value.true],
              previous,
            })[0];
            const _false = updateStatements({
              statements: [data.value.false],
              previous,
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
  previous: IStatement[],
  reference?: IStatement
): IData<OperationType> {
  const currentReference = operation.reference;
  let referenceResult = reference && getStatementResult(reference);
  let isReferenceRemoved =
    currentReference?.id &&
    (!reference?.name || isDataOfType(referenceResult, "operation"));
  let isTypeChanged = reference
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

  let updatedParameters = parameterList.map((parameter) => {
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
          let params = isDataOfType(parameter.data, "operation")
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
      return updateStatements({ statements: [argument], previous })[0];
    }
    return { ...parameter, data: { ...parameter.data, isGeneric: false } };
  });

  let updatedStatements = updateStatements({
    statements: statementList,
    previous: [...previous, /* ...closure, */ ...updatedParameters],
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
  previous: IStatement[]
): IStatement {
  const currentReference = currentStatement.data.reference;
  let reference = previous.find((item) => item.id === currentReference?.id);

  return {
    ...currentStatement,
    data: isDataOfType(currentStatement.data, "operation")
      ? getReferenceOperation(currentStatement.data, previous, reference)
      : getReferenceData(currentStatement.data, previous, reference),
    operations: currentStatement.operations.map((operation) => {
      const updatedParameters = updateStatements({
        statements: operation.value.parameters,
        previous,
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
  previous = [],
}: {
  statements: IStatement[];
  changedStatement?: IStatement;
  removeStatement?: boolean;
  previous?: IStatement[];
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

    let previousList = [...previous, ...prevStatements];
    return [
      ...prevStatements,
      updateStatementMethods(
        updateStatementReference(currentStatement, previousList),
        previousList
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

    let updatedStatements = updateStatements({
      statements: [
        ...currentOperation.value.parameters,
        ...currentOperation.value.statements,
      ],
      previous: prevOperations.map((operation) =>
        createStatement({
          data: operation,
          name: operation.value.name,
          id: operation.id,
        })
      ),
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
