import { TypeMapper } from "../src/lib/data";
import { IData, IFunction, IMethod, IStatement } from "../src/lib/types";
import { createData } from "../src/lib/utils";

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
    let { id, ...newData } = createData(
      data.type,
      TypeMapper[data.type].defaultValue,
      data.isGeneric
    );
    return {
      ...data,
      type: reference.result.type,
      value: reference.result.value,
      name: reference.variable,
      ...(hasTypeChanged && newData),
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
  let hasTypeChanged =
    reference && statement.data.type !== reference?.result.type;

  let { id, ...newData } = createData(
    statement.data.type,
    TypeMapper[statement.data.type].defaultValue,
    statement.data.isGeneric
  );
  return {
    ...statement,
    data: {
      ...statement.data,
      ...(reference
        ? updateRefVal(statement.data, reference)
        : statement.data.referenceId && newData),
    },
    methods: hasTypeChanged
      ? []
      : statement.methods.map((method) => {
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
  index: number,
  remove?: boolean
) {
  const statements = [...func.statements];
  if (changedStatement.variable === undefined) {
    if (!remove) statements[index] = changedStatement;
    return { ...func, statements } as IFunction;
  }
  let result = statements.reduce((prev, statement, i) => {
    if (i < index) return [...prev, statement];
    else if (statement.id === changedStatement.id)
      return [...prev, changedStatement];
    else {
      let updated = updateEntities(updateReferences(statement, prev));
      return [...prev, { ...updated, result: getLastEntity(updated) }];
    }
  }, [] as IStatement[]);
  return { ...func, statements: result } as IFunction;
}
