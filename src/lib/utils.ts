import { nanoid } from "nanoid";
import { TypeMapper } from "./data";
import { methodsList } from "./methods";
import { IData, IOperation, IMethod, IStatement, IType } from "./types";
import { getOperationResult } from "./update";

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

export function createOperation(name?: string): IOperation {
  let id = nanoid();
  return {
    id,
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
  if (first.entityType === "operation") {
    return isSameType(getOperationResult(first), second);
  } else if (second.entityType === "operation") {
    return isSameType(first, getOperationResult(second));
  } else {
    return first.type === second.type;
  }
}

export function getClosureList(reference: IStatement | IOperation) {
  const referenceData =
    reference.entityType === "statement" ? reference.data : reference;

  return referenceData.entityType === "operation"
    ? referenceData.reference?.call
      ? referenceData.parameters.concat(referenceData.closure)
      : referenceData.closure
    : null;
}

export function getFilteredMethods(data: IData) {
  return methodsList[data.type].filter((item) => {
    let parameters = item.parameters.map((p) =>
      createData(p.type, TypeMapper[p.type].defaultValue, p.isGeneric)
    );
    return (
      data.isGeneric || isSameType(data, item.handler(data, ...parameters))
    );
  });
}

export function createMethod({ data, name }: { data: IData; name?: string }) {
  let methods = getFilteredMethods(data);
  let methodByName = methods.find((method) => method.name === name);
  let newMethod = methodByName || methods[0];

  let parameters = newMethod.parameters.map((item) =>
    createData(item.type, TypeMapper[item.type].defaultValue, item.isGeneric)
  );
  let result = newMethod.handler(data, ...parameters);
  return {
    id: nanoid(),
    entityType: "method",
    name: newMethod.name,
    parameters: parameters.map((item) => createStatement({ data: item })),
    handler: newMethod.handler,
    result: { ...result, isGeneric: data.isGeneric },
  } as IMethod;
}
