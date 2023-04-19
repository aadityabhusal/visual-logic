import { TypeMapper } from "./data";
import { IOperation, IMethod, IStatement } from "./types";
import { createData } from "./utils";

export function getLastEntity(statement: IStatement, index?: number) {
  if (!index) {
    if (statement.data.entityType === "operation") return statement.data.result;
    return statement.data;
  }
  return statement.methods[index - 1].result;
}

export function getOperationResult(operation: IOperation) {
  let lastStatement = operation.statements.slice(-1)[0];
  return lastStatement
    ? getLastEntity(lastStatement, lastStatement.methods.length)
    : {
        ...operation.result,
        value: TypeMapper[operation.result.type].defaultValue,
      };
}

export function updateStatementMethods(statement: IStatement) {
  let updatedMethods = statement.methods.reduce(
    (previousMethods, currentMethod, index) => {
      let data = getLastEntity(
        { ...statement, methods: previousMethods },
        index
      );
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
  return { ...result, result: getLastEntity(result, result.methods.length) };
}

export function updateStatementReference(
  currentStatement: IStatement,
  previousStatements: IStatement[],
  previousOperations?: IOperation[]
): IStatement {
  const currentReference = getLastEntity(currentStatement).reference;
  const currentStatementData = getLastEntity(currentStatement);
  let reference = [...(previousOperations || []), ...previousStatements].find(
    (item) => item.id === currentReference?.id
  );

  let isReferenceRemoved =
    currentReference?.id && (!reference || !reference.name);
  let isTypeChanged =
    reference && currentStatementData.type !== reference.result.type;

  let { id: newId, ...newData } = createData(
    currentStatementData.type,
    TypeMapper[currentStatementData.type].defaultValue,
    currentStatementData.isGeneric
  );

  return {
    ...currentStatement,
    data: {
      ...currentStatementData,
      reference:
        reference?.name && currentReference
          ? { ...currentReference, name: reference?.name }
          : undefined,
      value: reference?.result.value ?? currentStatementData.value,
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
