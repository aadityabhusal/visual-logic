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

function updateRefVal(data: IData, reference: IStatement) {
  let hasTypeChanged = !data.isGeneric && data.type !== reference.result.type;
  let hasValueChanged =
    JSON.stringify(data.value) !== JSON.stringify(reference.result.value);

  if (data.name !== reference.variable || hasTypeChanged || hasValueChanged) {
    return {
      ...data,
      type: reference.result.type,
      value: reference.result.value,
      name: reference.variable,
      ...(hasTypeChanged && {
        type: data.type,
        value: TypeMapper[data.type].defaultValue,
        entityType: "data",
        referenceId: undefined,
        name: undefined,
      }),
    } as IData;
  }
}

function updateReferences(
  statement: IStatement,
  statements: IStatement[]
): IStatement {
  const reference = statements.find(
    (stmt) => stmt.id === statement.data.referenceId
  );
  return {
    ...statement,
    data: {
      ...statement.data,
      ...(reference && updateRefVal(statement.data, reference)),
    },
    methods: statement.methods.map((method) => {
      return {
        ...method,
        parameters: method.parameters.map((param) => {
          let result = updateEntities(updateReferences(param, statements));
          return { ...result, result: getLastEntity(result) };
        }),
      };
    }),
  };
}

export function updateFunction(
  func: IFunction,
  changedStatement: IStatement,
  index: number
) {
  const statements = [...func.statements];
  if (changedStatement.variable === undefined) {
    statements[index] = changedStatement;
    return { ...func, statements } as IFunction;
  }
  let result = statements.reduce((prev, statement, i) => {
    if (i < index) return [...prev, statement];
    else if (statement.id === changedStatement.id)
      return [...prev, changedStatement];
    else {
      // if (statement.data.type !== data.type) methods = [];
      let updated = updateEntities(updateReferences(statement, statements));
      return [...prev, { ...updated, result: getLastEntity(updated) }];
    }
  }, [] as IStatement[]);
  return { ...func, statements: result } as IFunction;
}
