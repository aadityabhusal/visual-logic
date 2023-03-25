import { TypeMapper } from "./data";
import { IOperation, IMethod, IStatement } from "./types";
import { createData } from "./utils";

export function getLastEntity(statement: IStatement) {
  if (!statement.methods.length) return statement.data;
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
  const currentReference = currentStatement.data.reference;
  const findReference = (item: IStatement | IOperation) =>
    item.id === currentReference?.id;

  const reference =
    currentReference?.type === "statement"
      ? previousStatements.find(findReference)
      : previousOperations?.find(findReference);

  let referenceName =
    reference?.entityType === "statement"
      ? reference?.variable
      : reference?.name;

  let isReferenceRemoved =
    currentReference?.id && (!reference || !referenceName);

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
        referenceName && currentReference
          ? { ...currentReference, name: referenceName }
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
  changedStatementIndex,
  removeStatement,
  previousOperations,
}: {
  statements: IStatement[];
  changedStatement?: IStatement;
  changedStatementIndex?: number;
  removeStatement?: boolean;
  previousOperations?: IOperation[];
}) {
  return statements.reduce((previousStatements, currentStatement, index) => {
    if (changedStatementIndex && index < changedStatementIndex)
      return [...previousStatements, currentStatement];

    if (changedStatement && currentStatement.id === changedStatement.id) {
      if (removeStatement) return previousStatements;
      else return [...previousStatements, changedStatement];
    }

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
  changedIndex: number,
  removeOperation?: boolean
) {
  return operations.reduce((prevOperations, currentOperation, index) => {
    if (index < changedIndex) return [...prevOperations, currentOperation];

    if (currentOperation.id === changedOperation.id) {
      if (removeOperation) return prevOperations;
      else return [...prevOperations, changedOperation];
    }
    let updatedStatements = updateStatements({
      statements: currentOperation.statements,
      previousOperations: prevOperations,
    });

    return [
      ...prevOperations,
      {
        ...currentOperation,
        statements: updatedStatements,
        result: getOperationResult({
          ...currentOperation,
          statements: updatedStatements,
        }),
      },
    ];
  }, [] as IOperation[]);
}
