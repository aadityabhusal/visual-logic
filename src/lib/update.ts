import { TypeMapper } from "./data";
import { IOperation, IMethod, IStatement } from "./types";
import { createData } from "./utils";

export function getLastEntity(statement: IStatement) {
  if (!statement.methods.length) return statement.data;
  return statement.methods[statement.methods.length - 1].result;
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
  previousStatements: IStatement[]
): IStatement {
  const reference = previousStatements.find(
    (statement) => statement.id === currentStatement.data.referenceId
  );

  let isReferenceRemoved =
    currentStatement.data.referenceId && (!reference || !reference?.variable);

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
      name: reference?.variable,
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

export function updateOperationStatements(
  operation: IOperation,
  changedStatement: IStatement,
  changedStatementIndex: number,
  removeStatement?: boolean
) {
  let updatedStatements = operation.statements.reduce(
    (previousStatements, currentStatement, index) => {
      if (index < changedStatementIndex)
        return [...previousStatements, currentStatement];

      if (currentStatement.id === changedStatement.id) {
        if (removeStatement) return previousStatements;
        else return [...previousStatements, changedStatement];
      }

      return [
        ...previousStatements,
        updateStatementMethods(
          updateStatementReference(currentStatement, previousStatements)
        ),
      ];
    },
    [] as IStatement[]
  );

  let lastStatement = updatedStatements.slice(-1)[0];
  let result = lastStatement ? getLastEntity(lastStatement) : operation.result;
  return { ...operation, statements: updatedStatements, result } as IOperation;
}
