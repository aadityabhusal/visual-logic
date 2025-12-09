import { nanoid } from "nanoid";
import { DataTypes } from "./data";
import {
  IData,
  IStatement,
  DataType,
  IDropdownItem,
  DataValue,
  OperationType,
  ConditionType,
  Context,
  UnionType,
  Parameter,
} from "./types";

/* Create */

export function createData<T extends DataType>(
  props: Partial<IData<T>>
): IData<T> {
  const type = (props.type || { kind: "undefined" }) as T;
  return {
    id: props.id ?? nanoid(),
    entityType: "data",
    type,
    value: props.value ?? createDefaultValue(type),
    isTypeEditable: props.isTypeEditable,
    reference: props.reference,
  };
}

export function createStatement(props?: Partial<IStatement>): IStatement {
  const newData =
    props?.data ||
    createData({ type: { kind: "undefined" }, isTypeEditable: true });
  const newId = props?.id || nanoid();
  return {
    id: newId,
    name: props?.name,
    entityType: "statement",
    data: newData,
    operations: props?.operations || [],
  };
}

export function createVariableName({
  prefix,
  prev,
  indexOffset = 0,
}: {
  prefix: string;
  prev: (IStatement | string)[];
  indexOffset?: number;
}) {
  const index = prev
    .map((s) => (typeof s === "string" ? s : s.name))
    .reduce((acc, cur) => {
      const match = cur?.match(new RegExp(`^${prefix}(\\d)?$`));
      if (!match) return acc;
      return match[1] ? Math.max(acc, Number(match[1]) + 1) : Math.max(acc, 1);
    }, indexOffset);
  return `${prefix}${index || ""}`;
}

function createStatementFromType(type: DataType, name?: string) {
  const value = createDefaultValue(type);
  const data = createData({ type, value, isTypeEditable: true });
  return createStatement({ data, name });
}

export function createDefaultValue<T extends DataType>(type: T): DataValue<T> {
  switch (type.kind) {
    case "never":
      return undefined as DataValue<T>;
    case "string":
      return "" as DataValue<T>;
    case "number":
      return 0 as DataValue<T>;
    case "boolean":
      return false as DataValue<T>;
    case "undefined":
      return undefined as DataValue<T>;
    case "unknown":
      return undefined as DataValue<T>;

    case "array": {
      if (
        type.elementType.kind === "unknown" ||
        type.elementType.kind === "never"
      )
        return [] as DataValue<T>;
      if (type.elementType.kind === "union") {
        return type.elementType.types.map((type) =>
          createStatementFromType(type)
        ) as DataValue<T>;
      }
      return [createStatementFromType(type.elementType)] as DataValue<T>;
    }

    case "object": {
      const map = new Map<string, IStatement>();
      for (const [key, propType] of Object.entries(type.properties)) {
        map.set(key, createStatementFromType(propType));
      }
      return map as DataValue<T>;
    }

    case "union": {
      // Use first type's default (could be enhanced to pick "most specific")
      return createDefaultValue(type.types[0]) as DataValue<T>;
    }

    case "operation": {
      return {
        parameters: type.parameters.map((param) =>
          createStatementFromType(param.type, param.name)
        ),
        statements: [],
        result: undefined,
      } as DataValue<T>;
    }

    case "condition": {
      const createStatement = (): IStatement => ({
        id: nanoid(),
        entityType: "statement",
        operations: [],
        data: createData({
          type: { kind: "undefined" },
          value: undefined,
          isTypeEditable: true,
        }),
      });

      return {
        condition: createStatement(),
        true: createStatement(),
        false: createStatement(),
        result: createStatement().data,
      } as DataValue<T>;
    }

    default:
      return undefined as DataValue<T>;
  }
}

export function createParamData(
  item: Parameter,
  data: IData
): IStatement["data"] {
  if (item.type.kind !== "operation") {
    return createData({
      type: item.type || data.type,
      isTypeEditable: item.isTypeEditable,
    });
  }

  const parameters = item.type.parameters.reduce((prev, paramSpec) => {
    prev.push(
      createStatement({
        name: paramSpec.name ?? createVariableName({ prefix: "param", prev }),
        data: createParamData({ type: paramSpec.type }, data),
      })
    );
    return prev;
  }, [] as IStatement[]);

  return createData({
    type: {
      kind: "operation",
      parameters: parameters.map((p) => ({ name: p.name, type: p.data.type })),
      result: { kind: "undefined" },
    },
    value: { parameters: parameters, statements: [] },
  });
}

/* Types */

export function isTypeCompatible(first: DataType, second: DataType): boolean {
  if (first.kind === "operation" && second.kind === "operation") {
    if (first.parameters.length !== second.parameters.length) return false;
    if (!isTypeCompatible(first.result, second.result)) return false;
    return first.parameters.every((firstParam, index) =>
      isTypeCompatible(firstParam.type, second.parameters[index].type)
    );
  }

  if (first.kind === "array" && second.kind === "array") {
    return isTypeCompatible(first.elementType, second.elementType);
  }

  if (first.kind === "object" && second.kind === "object") {
    const firstKeys = Object.keys(first.properties);
    const secondKeys = Object.keys(second.properties);
    if (firstKeys.length !== secondKeys.length) return false;
    return secondKeys.every(
      (key) =>
        first.properties[key] &&
        isTypeCompatible(first.properties[key], second.properties[key])
    );
  }

  if (first.kind === "union" && second.kind === "union") {
    if (first.types.length !== second.types.length) return false;
    // Bi-directional check to maintain order-independence and avoid duplicate types
    return (
      first.types.every((firstType) =>
        second.types.some((secondType) =>
          isTypeCompatible(firstType, secondType)
        )
      ) &&
      second.types.every((secondType) =>
        first.types.some((firstType) => isTypeCompatible(firstType, secondType))
      )
    );
  }

  if (first.kind === "union") {
    return first.types.some((t) => isTypeCompatible(t, second));
  }

  if (second.kind === "union") {
    return second.types.some((t) => isTypeCompatible(first, t));
  }

  return first.kind === second.kind;
}

export function isDataOfType<K extends DataType["kind"]>(
  data: IData<DataType> | undefined,
  kind: K
): data is IData<Extract<DataType, { kind: K }>> {
  return data?.type.kind === kind;
}

export function getInverseTypes(
  originalTypes: Context["variables"],
  narrowedTypes: Context["variables"]
): Context["variables"] {
  return narrowedTypes.entries().reduce((acc, [key, value]) => {
    const variable = originalTypes.get(key);
    if (!variable) return acc;
    let excludedType: DataType = variable.type;

    if (variable.type.kind === "union") {
      const remainingTypes = variable.type.types.filter(
        (t) => !isTypeCompatible(t, value.type)
      );
      if (remainingTypes.length === 0) excludedType = { kind: "never" };
      else excludedType = resolveUnionType(remainingTypes);
    } else if (isTypeCompatible(variable.type, value.type)) {
      excludedType = { kind: "never" }; // If not a union and types are compatible
    }

    if (excludedType.kind !== "never") {
      acc.set(key, { ...variable, type: excludedType });
    }
    return acc;
  }, new Map(originalTypes));
}

function objectTypeMatch(source: DataType, target: DataType): boolean {
  if (target.kind !== "object") return isTypeCompatible(source, target);
  if (source.kind !== "object") return false;
  return Object.entries(target.properties).every(([key, targetType]) => {
    const sourceType = source.properties[key];
    return sourceType && isTypeCompatible(sourceType, targetType);
  });
}

function narrowType(
  originalType: DataType,
  targetType: DataType
): DataType | undefined {
  if (targetType.kind === "never") return { kind: "never" };
  if (originalType.kind === "unknown") return targetType;
  if (originalType.kind === "union") {
    const narrowedTypes = originalType.types.filter((t) => {
      if (targetType.kind === "object") return objectTypeMatch(t, targetType);
      return isTypeCompatible(t, targetType);
    });

    if (narrowedTypes.length === 0) return undefined;
    return resolveUnionType(narrowedTypes);
  }
  if (originalType.kind === "object" && targetType.kind === "object") {
    return objectTypeMatch(originalType, targetType) ? originalType : undefined;
  }
  return originalType;
}

export function applyTypeNarrowing(
  originalTypes: Context["variables"],
  narrowedTypes: Context["variables"],
  data: IData,
  operation: IData<OperationType>
): Context["variables"] {
  if (!operation) return narrowedTypes;
  const param = operation.value.parameters[0];
  let narrowedType: DataType | undefined;
  let referenceName: string | undefined;

  if (
    (operation.value.name === "typeOf" || operation.value.name === "equals") &&
    param &&
    data.reference
  ) {
    referenceName = data.reference.name;
    const reference = originalTypes.get(referenceName);
    if (reference) {
      narrowedType = narrowType(
        reference.type,
        inferTypeFromValue(param.data.value)
      );
    }
  }

  if (
    (operation.value.name === "or" || operation.value.name === "and") &&
    param.data.reference
  ) {
    const source =
      operation.value.name === "or" ? originalTypes : narrowedTypes;
    const resultType = applyTypeNarrowing(
      source,
      new Map(source),
      param.data,
      param.operations[0]
    );
    referenceName = param.data.reference.name;
    const types = [
      narrowedTypes.get(param.data.reference.name)?.type,
      resultType.get(param.data.reference.name)?.type,
    ].filter(Boolean) as DataType[];

    if (types.length > 0) narrowedType = resolveUnionType(types);
  }

  if (operation.value.name === "not") {
    narrowedTypes = getInverseTypes(originalTypes, narrowedTypes);
  }

  if (referenceName) {
    narrowedTypes.set(referenceName, {
      ...originalTypes.get(referenceName)!,
      type: narrowedType ?? { kind: "never" },
    });
  }

  return narrowedTypes;
}

export function resolveUnionType(types: DataType[], union: true): UnionType;
export function resolveUnionType(types: DataType[], union?: false): DataType;
export function resolveUnionType(
  types: DataType[],
  forceUnion = false
): DataType | UnionType {
  const flattenedTypes = types.flatMap((type) => {
    if (!type) return [];
    return type.kind === "union" ? type.types : [type];
  });

  const uniqueTypes = flattenedTypes.reduce<DataType[]>((acc, type) => {
    if (
      !acc.some((t) => isTypeCompatible(t, type) && isTypeCompatible(type, t))
    ) {
      acc.push(type);
    }
    return acc;
  }, []);

  if (uniqueTypes.length === 0) return { kind: "never" };
  if (uniqueTypes.length === 1 && !forceUnion) return uniqueTypes[0];
  const sortedTypes = uniqueTypes.sort((a, b) => a.kind.localeCompare(b.kind));
  return { kind: "union", types: sortedTypes };
}

function getArrayElementType(elements: IStatement[]): DataType {
  if (elements.length === 0) return { kind: "unknown" };
  const firstType = elements[0].data.type;
  const allSameType = elements.every((element) => {
    return isTypeCompatible(element.data.type, firstType);
  });
  if (allSameType) return firstType;

  const unionTypes = elements.reduce((acc, element) => {
    const elementType = element.data.type;
    const exists = acc.some((t) => isTypeCompatible(t, elementType));
    if (!exists) acc.push(elementType);
    return acc;
  }, [] as DataType[]);
  return resolveUnionType(unionTypes);
}

function getOperationType(
  parameters: IStatement[],
  statements: IStatement[]
): OperationType {
  const parameterTypes = parameters.map((param) => ({
    name: param.name,
    type: param.data.type,
  }));

  let resultType: DataType = { kind: "undefined" };
  if (statements.length > 0) {
    const lastStatement = statements[statements.length - 1];
    resultType = getStatementResult(lastStatement).type;
  }

  return { kind: "operation", parameters: parameterTypes, result: resultType };
}

export function inferTypeFromValue<T extends DataType>(value: DataValue<T>) {
  if (value === undefined) return { kind: "undefined" } as T;
  if (typeof value === "string") return { kind: "string" } as T;
  if (typeof value === "number") return { kind: "number" } as T;
  if (typeof value === "boolean") return { kind: "boolean" } as T;
  if (Array.isArray(value)) {
    return { kind: "array", elementType: getArrayElementType(value) } as T;
  }
  if (value instanceof Map) {
    return {
      kind: "object",
      properties: value.entries().reduce((acc, [key, statement]) => {
        acc[key] = statement.data.type;
        return acc;
      }, {} as { [key: string]: DataType }),
    } as T;
  }
  if (
    value &&
    typeof value === "object" &&
    "parameters" in value &&
    "statements" in value &&
    Array.isArray(value.parameters) &&
    Array.isArray(value.statements)
  ) {
    return getOperationType(value.parameters, value.statements) as T;
  }
  if (
    value &&
    typeof value === "object" &&
    "condition" in value &&
    "true" in value &&
    "false" in value
  ) {
    const trueType = getStatementResult(value.true as IStatement).type;
    const falseType = getStatementResult(value.false as IStatement).type;
    const unionType = resolveUnionType(
      isTypeCompatible(trueType, falseType) ? [trueType] : [trueType, falseType]
    );
    return { kind: "condition", type: unionType } as T;
  }
  return { kind: "unknown" } as T;
}

export function getTypeSignature(type: DataType, maxDepth: number = 4): string {
  if (maxDepth <= 0) return "...";

  switch (type.kind) {
    case "never":
    case "undefined":
    case "string":
    case "number":
    case "boolean":
    case "unknown":
      return type.kind;

    case "array":
      return `${getTypeSignature(type.elementType, maxDepth - 1)}[]`;

    case "object": {
      const maxEntries = 3;
      const entries = Object.entries(type.properties).slice(0, maxEntries);
      const props = entries
        .map(([k, v]) => `${k}: ${getTypeSignature(v, maxDepth - 1)}`)
        .join(", ");
      return `{ ${props} ${entries.length > maxEntries ? ", ..." : ""} }`;
    }

    case "union":
      return type.types
        .map((t) => getTypeSignature(t, maxDepth - 1))
        .join(" | ");

    case "operation": {
      const params = type.parameters
        .map(
          (p) => `${p.name || "_"}: ${getTypeSignature(p.type, maxDepth - 1)}`
        )
        .join(", ");
      return `(${params}) => ${getTypeSignature(type.result, maxDepth - 1)}`;
    }

    case "condition":
      return getTypeSignature(type.type, maxDepth - 1);

    default:
      return "unknown";
  }
}

/* Result */

export function getStatementResult(
  statement: IStatement,
  index?: number,
  prevEntity?: boolean
  // TODO: Make use of the data type to create a better type for result e.g. a union type
): IData {
  let result = statement.data;
  const lastOperation = statement.operations[statement.operations.length - 1];
  if (index) {
    const statementResult = statement.operations[index - 1]?.value.result;
    result = statementResult ?? createData({ type: { kind: "undefined" } });
  } else if (!prevEntity && lastOperation) {
    result =
      lastOperation.value.result ?? createData({ type: { kind: "undefined" } });
  } else if (isDataOfType(result, "condition")) {
    result = result.value.result ?? getConditionResult(result.value);
  }
  return {
    ...result,
    id: nanoid(),
    ...(statement.name
      ? { reference: { id: statement.id, name: statement.name } }
      : {}),
  };
}

export function getConditionResult(condition: DataValue<ConditionType>): IData {
  const conditionResult = getStatementResult(condition.condition);
  return getStatementResult(
    conditionResult.value ? condition.true : condition.false
  );
}

/* Others */

export function getDataDropdownList({
  data,
  onSelect,
  context,
}: {
  data: IStatement["data"];
  onSelect: (operation: IStatement["data"], remove?: boolean) => void;
  context: Context;
}) {
  return [
    ...(Object.keys(DataTypes) as DataType["kind"][]).reduce((acc, kind) => {
      if (DataTypes[kind].hideFromDropdown) return acc;
      if (
        data.isTypeEditable ||
        (data.reference && kind === (data as IData).type.kind)
      ) {
        acc.push({
          entityType: "data",
          value: kind,
          onClick: () => {
            onSelect(
              createData({
                id: data.id,
                type: DataTypes[kind].type,
                isTypeEditable: data.isTypeEditable,
              })
            );
          },
        });
      }
      return acc;
    }, [] as IDropdownItem[]),
    ...context.variables.entries().reduce((acc, [name, variable]) => {
      if (!data.isTypeEditable && !isTypeCompatible(variable.type, data.type)) {
        return acc;
      }
      acc.push({
        value: name,
        secondaryLabel: variable.type.kind,
        variableType: variable.type,
        entityType: "data",
        onClick: () => onSelect(variable),
      });
      return acc;
    }, [] as IDropdownItem[]),
  ];
}

export function jsonParseReviver(_: string, value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "_map_" in value &&
    Array.isArray(value._map_)
  ) {
    return new Map(value._map_);
  }
  return value;
}

export function jsonStringifyReplacer(_: string, value: IData["value"]) {
  return value instanceof Map ? { _map_: Array.from(value.entries()) } : value;
}

export function isTextInput(element: Element | null) {
  if (element instanceof HTMLInputElement && element.type === "text") {
    return element;
  }
}
