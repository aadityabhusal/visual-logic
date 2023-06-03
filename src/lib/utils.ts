import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import { IData, IOperation, IMethod, IStatement, IType } from "./types";

export function createData<T extends keyof IType>({
  type,
  value,
  isGeneric,
}: {
  type: T;
  value?: IType[T];
  isGeneric?: boolean;
}): IData<T> {
  return {
    id: nanoid(),
    entityType: "data",
    type,
    value: value || TypeMapper[type].defaultValue,
    isGeneric,
    reference: undefined,
  };
}

export function createOperation(props?: {
  name?: string;
  parameters?: IStatement[];
  isGeneric?: boolean;
}): IOperation {
  let id = nanoid();
  return {
    id,
    isGeneric: props?.isGeneric,
    entityType: "operation",
    handler: undefined,
    name: props?.name ?? "f_" + id.slice(-4),
    parameters: props?.parameters || [],
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
  let newData = props?.data || createData({ type: "string", isGeneric: true });
  let newId = props?.id || nanoid();
  return {
    id: newId,
    name: props?.name !== undefined ? `v_${newId.slice(-3)}` : undefined,
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
    : createData({ type: "string" });
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
  argumentList?: IOperation["parameters"]
): IStatement[] {
  return parameters.map((param) => {
    let argData = argumentList?.find((item) => item.id === param.id)?.data;
    let paramData = { ...param.data, isGeneric: argData?.isGeneric };
    if (paramData.entityType === "data") {
      let argValue = argData?.entityType === "data" ? argData.value : undefined;
      paramData = {
        ...paramData,
        value: argValue || TypeMapper[paramData.type].defaultValue,
      };
    } else {
      let argParams =
        argData?.entityType === "operation" ? argData.parameters : undefined;
      paramData = {
        ...paramData,
        parameters: resetParameters(paramData.parameters, argParams),
      };
    }
    return { ...param, data: paramData };
  });
}

export function getPreviousStatements(previous: (IStatement | IOperation)[]) {
  return previous.map((item) =>
    item.entityType === "operation"
      ? createStatement({ id: item.id, name: item.name, data: item })
      : item
  );
}
