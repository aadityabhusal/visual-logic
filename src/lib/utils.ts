import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import { IData, IOperation, IMethod, IStatement, IType } from "./types";

export function createData<T extends keyof IType>(
  type: T,
  value: IType[T],
  isGeneric?: boolean
): IData<T> {
  return {
    id: nanoid(),
    entityType: "data",
    type,
    value,
    isGeneric,
    reference: undefined,
  };
}

export function createOperation(
  name?: string,
  isGeneric?: boolean
): IOperation {
  let id = nanoid();
  return {
    id,
    isGeneric,
    entityType: "operation",
    handler: undefined,
    name: name ?? "f_" + id.slice(-4),
    parameters: [],
    statements: [],
    closure: [],
    reference: undefined,
  };
}

export function createStatement(props?: {
  id?: string;
  name?: string;
  data?: IStatement["data"];
  methods?: IMethod[];
}): IStatement {
  let newData = props?.data || createData("string", "", true);
  return {
    id: props?.id || nanoid(),
    name: props?.name,
    entityType: "statement",
    data: newData,
    methods: props?.methods || [],
  };
}

export function isSameType(
  first: IStatement["data"],
  second: IStatement["data"]
): boolean {
  if (first.entityType === "operation" && second.entityType === "operation") {
    if (first.parameters.length !== second.parameters.length) return false;
    return first.parameters.every((firstParam, index) =>
      isSameType(firstParam.data, second.parameters[index].data)
    );
  } else if (first.entityType === "operation") {
    if (!first.reference?.isCalled) return false;
    return isSameType(getOperationResult(first), second);
  } else if (second.entityType === "operation") {
    if (!second.reference?.isCalled) return false;
    return isSameType(first, getOperationResult(second));
  } else {
    return first.type === second.type;
  }
}

export function getClosureList(reference: IStatement | IOperation) {
  const referenceData =
    reference.entityType === "statement" ? reference.data : reference;

  return referenceData.entityType === "operation"
    ? referenceData.reference?.isCalled
      ? referenceData.parameters.concat(referenceData.closure)
      : referenceData.closure
    : null;
}

export function getOperationResult(operation: IOperation) {
  let lastStatement = operation.statements.slice(-1)[0];
  return lastStatement
    ? getStatementResult(lastStatement)
    : createData("string", TypeMapper["string"].defaultValue);
}

export function getStatementResult(
  statement: IStatement,
  index?: number,
  prevEntity?: boolean
): IData | IOperation {
  let data = statement.data;
  if (index) return statement.methods[index - 1]?.result;
  let lastStatement = statement.methods[statement.methods.length - 1];
  if (!prevEntity && lastStatement) return lastStatement.result;
  return data.entityType === "operation" && data.reference?.isCalled
    ? getOperationResult(data)
    : data;
}

export function resetParameters(
  parameters: IOperation["parameters"],
  isGeneric?: boolean
) {
  return parameters.map((param) => {
    let paramData: IStatement["data"] = { ...param.data };
    if (paramData.entityType === "data") {
      paramData.value = TypeMapper[paramData.type].defaultValue;
    } else {
      paramData.parameters = resetParameters(
        paramData.parameters,
        isGeneric ?? paramData.isGeneric
      );
      paramData.closure = [];
      paramData.statements = [];
    }
    return {
      ...param,
      data: { ...paramData, isGeneric: isGeneric ?? paramData.isGeneric },
    };
  });
}
