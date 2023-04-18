import { TypeMapper } from "./data";
import { IOperation, IMethod, IStatement } from "./types";
import { createData } from "./utils";

export function getLastEntity(statement: IStatement) {
  if (!statement.methods.length) {
    if (statement.data.type === "operation") {
      return (statement.data.value as IOperation).result;
    }
    return statement.data;
  }
  return statement.methods[statement.methods.length - 1].result;
}

export function getOperationResult(operation: IOperation) {
  let lastStatement = operation.statements.slice(-1)[0];
  return lastStatement
    ? getLastEntity(lastStatement)
    : {
        ...operation.result,
        value: TypeMapper[operation.result.type].defaultValue,
      };
}

export function updateStatementMethods(statement: IStatement) {
  let updatedMethods = statement.methods.reduce(
    (previousMethods, currentMethod, index) => {
      let data =
        index === 0 ? statement.data : previousMethods[index - 1].result;
      let parameters = currentMethod.parameters.map((item) => item.result);
      let { id: newId, ...result } = currentMethod.handler(data, ...parameters);
      let rest = { id: currentMethod.result.id, isGeneric: data.isGeneric };

      return [
        ...previousMethods,
        { ...currentMethod, result: { ...result, ...rest } },
      ];
    },
    [] as IMethod[]
  );
  let result = { ...statement, methods: updatedMethods };
  return { ...result, result: getLastEntity(result) };
}

export function updateStatementReference(
  currentStatement: IStatement,
  previousStatements: IStatement[],
  previousOperations?: IOperation[]
): IStatement {
  let currentReference = currentStatement.data.reference;
  let reference = [...(previousOperations || []), ...previousStatements].find(
    (item) => item.id === currentReference?.id
  );

  let refOperation =
    reference?.entityType === "operation"
      ? reference
      : (reference?.data.value as IOperation);

  if (currentReference?.parameters && refOperation) {
    let updatedParameters = refOperation.parameters.map((parameter) => {
      let argument = currentReference?.parameters?.find(
        (item) => item.id === parameter.id
      );

      if (!argument) return parameter;

      return updateStatementMethods(
        updateStatementReference(
          argument,
          previousStatements,
          previousOperations
        )
      );
    });

    let statements = updateStatements({
      statements: [
        ...previousStatements,
        ...updatedParameters,
        ...refOperation.statements,
      ],
      changedStatement: updatedParameters[0],
      previousOperations,
    });

    reference = {
      ...(reference as IOperation),
      parameters: updatedParameters,
      result: getOperationResult({ ...refOperation, statements }),
    };
  }

  let isReferenceRemoved =
    currentReference?.id && (!reference || !reference.name);
  let isTypeChanged =
    reference && currentStatement.data.type !== reference.result.type;

  let { id: newId, ...newData } = createData(
    currentStatement.data.type,
    TypeMapper[currentStatement.data.type].defaultValue,
    currentStatement.data.isGeneric
  );

  return {
    ...currentStatement,
    data: {
      ...currentStatement.data,
      reference:
        reference?.name && currentReference
          ? {
              ...currentReference,
              parameters: (reference as IOperation).parameters,
              name: reference?.name,
            }
          : undefined,
      value: reference?.result.value ?? currentStatement.data.value,
      ...((isReferenceRemoved || isTypeChanged) && newData),
    },
    methods: currentStatement.methods.map((method) => ({
      ...method,
      parameters: method.parameters.map((param) =>
        updateStatementMethods(
          updateStatementReference(param, previousStatements)
        )
      ),
    })),
  };
}

export function updateStatements({
  statements,
  changedStatement,
  removeStatement,
  previousOperations,
}: {
  statements: IStatement[];
  changedStatement?: IStatement;
  removeStatement?: boolean;
  previousOperations?: IOperation[];
}) {
  let currentIndexFound = false;
  return statements.reduce((previousStatements, currentStatement) => {
    if (currentStatement.id === changedStatement?.id) {
      currentIndexFound = true;
      if (removeStatement) return previousStatements;
      else return [...previousStatements, changedStatement];
    }

    if (changedStatement && !currentIndexFound)
      return [...previousStatements, currentStatement];

    return [
      ...previousStatements,
      updateStatementMethods(
        updateStatementReference(
          currentStatement,
          previousStatements,
          previousOperations
        )
      ),
    ];
  }, [] as IStatement[]);
}

export function updateOperations(
  operations: IOperation[],
  changedOperation: IOperation,
  removeOperation?: boolean
) {
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
        ...currentOperation.parameters,
        ...currentOperation.statements,
      ],
      previousOperations: prevOperations,
    });
    const parameterLength = currentOperation.parameters.length;
    return [
      ...prevOperations,
      {
        ...currentOperation,
        parameters: updatedStatements.slice(0, parameterLength),
        statements: updatedStatements.slice(parameterLength),
        result: getOperationResult({
          ...currentOperation,
          statements: updatedStatements,
        }),
      },
    ];
  }, [] as IOperation[]);
}
