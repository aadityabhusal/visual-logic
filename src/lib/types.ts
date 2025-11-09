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

export type DataType =
  | UndefinedType
  | StringType
  | NumberType
  | BooleanType
  | ArrayType
  | ObjectType
  | UnionType;

export type DataValue<T extends DataType> = T extends UndefinedType
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
  ? Map<keyof T["properties"], IStatement>
  : T extends UnionType & { types: infer U extends DataType[] }
  ? DataValue<U[number]>
  : any;

export interface IReference {
  id: string;
  name: string;
  isCalled?: boolean;
}

export interface IData<T extends DataType = DataType> {
  id: string;
  entityType: "data";
  type: T;
  value: DataValue<T>;
  isGeneric?: boolean;
  reference?: IReference;
}

export interface IMethod {
  id: string;
  name: string;
  entityType: "method";
  parameters: IStatement[];
  result: IStatement["data"];
}

export interface IStatement {
  id: string;
  entityType: "statement";
  data: IData | IOperation;
  methods: IMethod[];
  name?: string;
}

export interface IOperation {
  id: string;
  entityType: "operation";
  name?: string;
  parameters: IStatement[];
  closure: IStatement[];
  statements: IStatement[];
  isGeneric?: boolean;
  reference?: IReference;
}

export interface IDropdownItem {
  label?: string;
  secondaryLabel?: string;
  value: string;
  entityType: "data" | "method" | "operation";
  onClick?: () => void;
}
