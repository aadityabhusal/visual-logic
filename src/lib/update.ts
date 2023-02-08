import { TypeMapper } from "./data";
import { IData, IFunction, IMethod, IStatement, IType } from "./types";

export function getLastEntity(statement: IStatement) {
  if (!statement.methods.length) return statement.data;
  return statement.methods[statement.methods.length - 1].result;
}

export function updateEntities(statement: IStatement) {
  let methods = [...statement.methods];
  let result = methods.reduce((prev, method, i) => {
    let data = i === 0 ? statement.data : prev[i - 1].result;
    let parameters = method.parameters.map((item) => item.result);
    let result = method.handler(data, ...parameters);
    let isGeneric = data.isGeneric;
    return [...prev, { ...method, result: { ...result, isGeneric } }];
  }, [] as IMethod[]);
  return { ...statement, methods: result };
}

/* 
  When a statement updates and had a variable
      - search throughout the code for its variable reference
      - update the variable value and its statement result
   */

function updateVal(
  data: IData,
  reference: IStatement,
  changedType?: keyof IType
): IData {
  console.log(changedType, reference);

  return {
    ...data,
    ...(changedType
      ? {
          type: changedType,
          value: TypeMapper[data.type].defaultValue,
          entityType: "data",
          referenceId: undefined,
          name: undefined,
        }
      : reference
      ? {
          type: reference.result.type,
          value: reference.result.value,
          name: reference.variable,
        }
      : {}),
  };
}

function updateRefVal(data: IData, reference: IStatement) {
  if (!reference) {
    return updateVal(data, reference, data.referenceId ? data.type : undefined);
  }
  if (
    data.type !== reference.result.type ||
    data.name !== reference.variable ||
    JSON.stringify(data.value) !== JSON.stringify(reference.result.value)
  ) {
    let typeChanged = !data.isGeneric && data.type !== reference.result.type;
    return updateVal(data, reference, typeChanged ? data.type : undefined);
  }
}

function updateReferences(
  statement: IStatement,
  reference: IStatement
): IStatement {
  return {
    ...statement,
    data: { ...statement.data, ...updateRefVal(statement.data, reference) },
    methods: statement.methods.map((method) => {
      return {
        ...method,
        parameters: method.parameters.map((param) => {
          if (param.data.referenceId === reference.id) {
            let result = updateEntities(updateReferences(param, reference));
            return { ...result, result: getLastEntity(result) };
          } else return param;
        }),
      };
    }),
  };
}

export function updateFunction(func: IFunction, statement: IStatement) {
  const statements = [...func.statements];
  let result = statements.reduce((prev, item) => {
    if (item.id === statement.id) return [...prev, statement];
    else {
      let updated = updateEntities(updateReferences(item, statement));
      return [...prev, { ...updated, result: getLastEntity(updated) }];
    }
  }, [] as IStatement[]);
  return { ...func, statements: result } as IFunction;
}
