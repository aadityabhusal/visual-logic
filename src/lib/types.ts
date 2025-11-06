export type IUndefinedType = { kind: "undefined" };
export type IStringType = { kind: "string" };
export type INumberType = { kind: "number" };
export type IBooleanType = { kind: "boolean" };
export type ITupleType = { kind: "tuple"; elementsType: IType[] };
export type IListType = { kind: "list"; elementType: IType };
export type IObjectType = {
  kind: "object";
  properties: { [key: string]: IType };
};
export type IRecordType = { kind: "record"; valueType: IType };
export type IUnionType = { kind: "union"; types: IType[] };

export type IType =
  | IUndefinedType
  | IStringType
  | INumberType
  | IBooleanType
  | ITupleType
  | IListType
  | IObjectType
  | IRecordType
  | IUnionType;

export type IValue<T extends IType = IUndefinedType> = T extends IUndefinedType
  ? undefined
  : T extends IStringType
  ? string
  : T extends INumberType
  ? number
  : T extends IBooleanType
  ? boolean
  : T extends ITupleType & { elementsType: infer E extends IType[] }
  ? { [K in keyof E]: E[K] extends IType ? IStatement<E[K]> : never }
  : T extends IListType
  ? IStatement<T["elementType"]>[]
  : T extends IObjectType
  ? { [K in keyof T["properties"]]: IStatement<T["properties"][K]> }
  : T extends IRecordType
  ? Map<string, IStatement<T["valueType"]>>
  : T extends IUnionType
  ? IStatement<T["types"][number]>
  : any;

export type IReference = {
  id: string;
  name: string;
  isCalled?: boolean;
};

export interface IData<T extends IType = IType> {
  id: string;
  entityType: "data";
  type: T;
  value: IValue<T>;
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

export interface IStatement<T extends IType = IType> {
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

export type IDropdownItem = {
  label?: string;
  secondaryLabel?: string;
  value: string;
  entityType: "data" | "method" | "operation";
  onClick?: () => void;
};
