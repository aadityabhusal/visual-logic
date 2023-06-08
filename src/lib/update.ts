import { methodsList } from "./methods";
import { IOperation, IMethod, IStatement, IData } from "./types";
import {
  createData,
  getClosureList,
  getPreviousStatements,
  getStatementResult,
  isSameType,
  resetParameters,
} from "./utils";

export function updateStatementMethods(
  statement: IStatement,
  previous: IStatement[] = []
): IStatement {
  let updatedMethods = statement.methods.reduce(
    (previousMethods, currentMethod, index) => {
      let data = getStatementResult(
        { ...statement, methods: previousMethods },
        index
      );
      let parameters = currentMethod.parameters.map((item) => {
        let closure = item.data.entityType === "operation" && {
          closure: [...item.data.closure, ...previous],
        };
        return getStatementResult({
          ...item,
          data: { ...item.data, ...closure },
        });
      });
      let methodHandler = methodsList[(data as IData).type].find(
        (item) => item.name === currentMethod.name
      )?.handler;

      let { id: newId, ...result } =
        methodHandler?.(data, ...parameters) || currentMethod.result;
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
  previous: IStatement[],
  reference?: IStatement
): IData {
  const currentReference = data.reference;
  let referenceResult = reference && getStatementResult(reference);

  const isTypeChanged =
    reference &&
    (referenceResult?.entityType !== "data" ||
      data.type !== referenceResult?.type);
  const isReferenceRemoved =
    currentReference?.id &&
    (!reference || !reference.name || referenceResult?.entityType !== "data");

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
        : data.value,
    ...((isReferenceRemoved || isTypeChanged) && newData),
  };
}

export function getReferenceOperation(
  operation: IOperation,
  previous: IStatement[],
  reference?: IStatement
): IOperation {
  const currentReference = operation.reference;
  let referenceResult = reference && getStatementResult(reference);
  let isReferenceRemoved =
    currentReference?.id &&
    (!reference ||
      !reference.name ||
      referenceResult?.entityType !== "operation");
  let isTypeChanged = reference ? !isSameType(operation, reference.data) : true;

  let parameterList = operation.parameters;
  let statementList = operation.statements;
  let closure = operation.closure;
  if (reference && referenceResult?.entityType === "operation") {
    parameterList = referenceResult?.parameters;
    statementList = referenceResult?.statements;
    closure = getClosureList(reference) || closure;
  }

  let updatedParameters = parameterList.map((parameter) => {
    let argument = operation.parameters?.find(
      (item) => item.id === parameter.id
    );
    if (argument) {
      if (!isSameType(parameter.data, getStatementResult(argument))) {
        if (argument.data.entityType === "operation") {
          let params =
            parameter.data.entityType === "operation"
              ? parameter.data.parameters
              : argument.data.parameters;
          argument = {
            ...argument,
            data: {
              ...argument.data,
              parameters: resetParameters(params, argument.data.parameters),
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
    previous: [...previous, ...closure, ...updatedParameters],
  });

  return {
    ...operation,
    closure,
    parameters: isTypeChanged
      ? resetParameters(updatedParameters, operation.parameters)
      : updatedParameters,
    statements: updatedStatements,
    reference:
      reference?.name && currentReference && !isReferenceRemoved
        ? { ...currentReference, name: reference?.name }
        : undefined,
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
    data:
      currentStatement.data.entityType === "data"
        ? getReferenceData(currentStatement.data, previous, reference)
        : getReferenceOperation(currentStatement.data, previous, reference),
    methods: currentStatement.methods.map((method) => ({
      ...method,
      parameters: updateStatements({ statements: method.parameters, previous }),
    })),
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
  previous?: (IStatement | IOperation)[];
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

    let previousList = [...getPreviousStatements(previous), ...prevStatements];
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
      previous: prevOperations,
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
