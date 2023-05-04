import { TypeMapper } from "./data";
import { IOperation, IMethod, IStatement, IData } from "./types";
import { createData, createOperation } from "./utils";

export function getStatementResult(
  statement: IStatement,
  index?: number
): IData | IOperation {
  let data = statement.data;
  if (index) return statement.methods[index - 1]?.result;
  let lastStatement = statement.methods[statement.methods.length - 1];
  if (lastStatement) return lastStatement.result;
  return data;
}

export function getOperationResult(operation: IOperation) {
  let lastStatement = operation.statements.slice(-1)[0];
  return lastStatement
    ? getStatementResult(lastStatement)
    : createData("string", TypeMapper["string"].defaultValue);
}

export function updateStatementMethods(statement: IStatement): IStatement {
  let updatedMethods = statement.methods.reduce(
    (previousMethods, currentMethod, index) => {
      let data = getStatementResult(
        { ...statement, methods: previousMethods },
        index
      );
      let parameters = currentMethod.parameters.map((item) =>
        getStatementResult(item)
      );
      let { id: newId, ...result } = currentMethod.handler(data, ...parameters);
      let rest = { id: currentMethod.result.id, isGeneric: data.isGeneric };

      return [
        ...previousMethods,
        { ...currentMethod, result: { ...result, ...rest } },
      ];
    },
    [] as IMethod[]
  );
  return { ...statement, methods: updatedMethods };
}

function getReferenceData(
  data: IData,
  reference?: IStatement
): IData | IOperation {
  const currentReference = data.reference;
  const referenceResult = reference && getStatementResult(reference);
  const isTypeChanged =
    reference &&
    referenceResult?.entityType === "data" &&
    data.type !== referenceResult.type;

  const isReferenceRemoved =
    currentReference?.id &&
    (!reference ||
      !reference.name ||
      (reference.data.entityType !== "data" &&
        !reference?.data.reference?.call));

  const { id: newId, ...newData } = createData(
    data.type,
    TypeMapper[data.type].defaultValue,
    data.isGeneric
  );

  let res =
    referenceResult?.entityType === "operation"
      ? ({
          entityType: "operation",
          parameters: referenceResult.parameters,
          statements: referenceResult.statements,
          name: referenceResult.name,
        } as IOperation)
      : ({
          entityType: "data",
          value: reference ? referenceResult?.value : data.value,
        } as IData);

  return {
    ...data,
    reference:
      reference?.name && currentReference
        ? { ...currentReference, name: reference?.name }
        : undefined,
    ...res,
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
        [...previousStatements, ...updatedParameters, ...statementList],
        previousOperations
      )
    )
  );

  return {
    ...operation,
    parameters: updatedParameters,
    statements: updatedStatements,
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
}): IStatement[] {
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
): IOperation[] {
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
      },
    ];
  }, [] as IOperation[]);
}
