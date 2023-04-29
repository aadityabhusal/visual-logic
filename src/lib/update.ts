import { TypeMapper } from "./data";
import { IOperation, IMethod, IStatement, IData } from "./types";
import { createData, createOperation } from "./utils";

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

function getReferenceData(data: IData, reference?: IStatement): IData {
  const currentReference = data.reference;
  const isTypeChanged = reference && data.type !== reference.result.type;
  const isReferenceRemoved =
    currentReference?.id &&
    (!reference ||
      !reference.name ||
      reference.data.entityType !== data.entityType);

  const { id: newId, ...newData } = createData(
    data.type,
    TypeMapper[data.type].defaultValue,
    data.isGeneric
  );

  return {
    ...data,
    reference:
      reference?.name && currentReference
        ? { ...currentReference, name: reference?.name }
        : undefined,
    value: reference?.result.value ?? data.value,
    ...((isReferenceRemoved || isTypeChanged) && newData),
  };
}

export function getReferenceOperation(
  operation: IOperation,
  previousStatements: IStatement[],
  previousOperations?: IOperation[],
  reference?: IStatement
): IOperation {
  const currentReference = operation.reference;
  let isReferenceRemoved =
    currentReference?.id &&
    (!reference ||
      !reference.name ||
      reference.data.entityType !== operation.entityType);

  const { id: newId, ...newOperation } = createOperation("");

  let parameterList = operation.parameters;
  let statementList = operation.statements;
  if (reference?.data.entityType === "operation") {
    parameterList = reference?.data.parameters;
    statementList = reference?.data.statements;
  }

  let updatedParameters = parameterList.map((parameter) => {
    let argument = operation.parameters?.find(
      (item) => item.id === parameter.id
    );
    if (!argument) return parameter;
    return updateStatementMethods(
      updateStatementReference(argument, previousStatements, previousOperations)
    );
  });

  let updatedStatements = statementList.map((argument) =>
    updateStatementMethods(
      updateStatementReference(
        argument,
        [...previousStatements, ...updatedParameters, ...operation.statements],
        previousOperations
      )
    )
  );

  return {
    ...operation,
    parameters: updatedParameters,
    statements: updatedStatements,
    result: getOperationResult({ ...operation, statements: updatedStatements }),
    reference:
      reference?.name && currentReference
        ? { ...currentReference, name: reference?.name }
        : undefined,
    ...(isReferenceRemoved && newOperation),
  };
}

export function updateStatementReference(
  currentStatement: IStatement,
  previousStatements: IStatement[],
  previousOperations?: IOperation[]
): IStatement {
  const currentReference = currentStatement.data.reference;
  let reference = previousStatements.find(
    (item) => item.id === currentReference?.id
  );

  // Should this be done in this way?
  let operationRef = previousOperations?.find(
    (item) => item.id === currentReference?.id
  );
  if (operationRef) {
    reference = {
      id: operationRef.id,
      name: operationRef.name,
      entityType: "statement",
      data: operationRef,
      result: operationRef.result,
    } as IStatement;
  }

  return {
    ...currentStatement,
    data:
      currentStatement.data.entityType === "data"
        ? getReferenceData(currentStatement.data, reference)
        : getReferenceOperation(
            currentStatement.data,
            previousStatements,
            previousOperations,
            reference
          ),
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
          statements: updatedStatements.slice(parameterLength),
        }),
      },
    ];
  }, [] as IOperation[]);
}
