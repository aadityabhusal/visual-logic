import { nanoid } from "nanoid";
import { IData, IMethod, IStatement, DataType } from "./types";
import {
  createData,
  createOperation,
  createStatement,
  createVariableName,
  getStatementResult,
  isSameType,
} from "./utils";

export type IMethodList = {
  name: string;
  parameters: {
    name?: string;
    type?: DataType | "operation";
    parameters?: IMethodList["parameters"];
    isGeneric?: boolean;
  }[];
  handler(...args: IStatement["data"][]): IStatement["data"];
};

export const methodsList: Record<DataType["kind"], IMethodList[]> = {
  undefined: [],
  string: [],
  number: [],
  boolean: [],
  array: [],
  object: [],
  union: [],
};

function createParamData(
  item: IMethodList["parameters"][0],
  data: IData
): IStatement["data"] {
  return item.type === "operation"
    ? createOperation({
        parameters: item.parameters?.reduce((prev, item) => {
          prev.push(
            createStatement({
              name: item.name ?? createVariableName({ prefix: "param", prev }),
              data: createParamData(item, data),
            })
          );
          return prev;
        }, [] as IStatement[]),
        isGeneric: item.isGeneric,
      })
    : createData({ type: item.type || data.type, isGeneric: item.isGeneric });
}

export function getFilteredMethods(data: IData) {
  return methodsList[data.type.kind].filter((item) => {
    let parameters = item.parameters.map((p) => createParamData(p, data));
    return (
      data.isGeneric ||
      (isSameType(data, item.handler(data, ...parameters)) &&
        parameters.every((p) => !p.isGeneric))
    );
  });
}

export function createMethod({
  data,
  name,
  prevParams,
}: {
  data: IData;
  name?: string;
  prevParams?: IStatement[];
}): IMethod {
  let methods = getFilteredMethods(data);
  let methodByName = methods.find((method) => method.name === name);
  let newMethod = methodByName || methods[0];

  let parameters = newMethod.parameters.map((item, index) => {
    const newParam = createStatement({ data: createParamData(item, data) });
    const prevParam = prevParams?.[index];
    if (
      prevParam &&
      isSameType(newParam.data, prevParam.data) &&
      isSameType(newParam.data, getStatementResult(prevParam))
    ) {
      return prevParam;
    }
    return newParam;
  });
  let result = newMethod.handler(
    data,
    ...parameters.map((p) => getStatementResult(p))
  );
  return {
    id: nanoid(),
    entityType: "method",
    name: newMethod.name,
    parameters,
    result: { ...result, isGeneric: data.isGeneric },
  } satisfies IMethod;
}
