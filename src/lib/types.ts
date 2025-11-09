export type UndefinedType = { kind: "undefined" };
export type StringType = { kind: "string" };
export type NumberType = { kind: "number" };
export type BooleanType = { kind: "boolean" };
export type TupleType = { kind: "tuple"; elementsType: DataType[] };
export type ListType = { kind: "list"; elementType: DataType };
export type ObjectType = {
  kind: "object";
  properties: { [key: string]: DataType };
};
export type RecordType = { kind: "record"; valueType: DataType };
export type UnionType = { kind: "union"; types: DataType[] };

export type DataType =
  | UndefinedType
  | StringType
  | NumberType
  | BooleanType
  | TupleType
  | ListType
  | ObjectType
  | RecordType
  | UnionType;

export type DataValue<T extends DataType> = T extends UndefinedType
  ? undefined
  : T extends StringType
  ? string
  : T extends NumberType
  ? number
  : T extends BooleanType
  ? boolean
  : T extends TupleType & { elementsType: infer E extends DataType[] }
  ? { [K in keyof E]: E[K] extends DataType ? IStatement<E[K]> : never }
  : T extends ListType
  ? IStatement<T["elementType"]>[]
  : T extends ObjectType
  ? Map<
      keyof T["properties"],
      IStatement<T["properties"][keyof T["properties"]]>
    >
  : T extends RecordType
  ? Map<string, IStatement<T["valueType"]>>
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

export interface IStatement<T extends DataType = DataType> {
  id: string;
  entityType: "statement";
  data: IData<T> | IOperation;
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
