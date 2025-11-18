export type UndefinedType = { kind: "undefined" };
export type StringType = { kind: "string" };
export type NumberType = { kind: "number" };
export type BooleanType = { kind: "boolean" };

export type ArrayType = { kind: "array"; elementType: DataType };
export type ObjectType = {
  kind: "object";
  properties: { [key: string]: DataType };
};
export type UnionType = { kind: "union"; types: DataType[] };
export type OperationType = {
  kind: "operation";
  parameters: { name?: string; type: DataType }[];
  result: DataType;
};
export type ConditionType = { kind: "condition"; type: UnionType };
export type UnknownType = { kind: "unknown" };

export type DataType =
  | UnknownType
  | UndefinedType
  | StringType
  | NumberType
  | BooleanType
  | ArrayType
  | ObjectType
  | UnionType
  | OperationType
  | ConditionType;

type BaseDataValue<T extends DataType> = T extends UnknownType
  ? unknown
  : T extends UndefinedType
  ? undefined
  : T extends StringType
  ? string
  : T extends NumberType
  ? number
  : T extends BooleanType
  ? boolean
  : T extends ArrayType
  ? IStatement[]
  : T extends ObjectType
  ? Map<keyof T["properties"] & string, IStatement>
  : T extends OperationType
  ? {
      parameters: IStatement[];
      statements: IStatement[];
      result?: IData;
      name?: string; // for non-statement operations
    }
  : T extends ConditionType
  ? {
      condition: IStatement;
      true: IStatement;
      false: IStatement;
      result?: IData;
    }
  : never;

export type DataValue<T extends DataType> = T extends UnionType & {
  types: infer U extends DataType[];
}
  ? BaseDataValue<U[number]>
  : BaseDataValue<T>;

export interface IData<T extends DataType = DataType> {
  id: string;
  entityType: "data";
  type: T;
  value: DataValue<T>;
  isGeneric?: boolean;
  reference?: { id: string; name: string };
}

export interface IStatement {
  id: string;
  entityType: "statement";
  data: IData;
  operations: IData<OperationType>[];
  name?: string;
}

export interface IDropdownItem {
  label?: string;
  secondaryLabel?: string;
  value: string;
  entityType: "data" | "method" | "operation";
  onClick?: () => void;
}
