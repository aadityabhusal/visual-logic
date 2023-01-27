export type IType = {
  string: string;
  number: number;
  boolean: boolean;
  array: IData[];
  object: Map<string, IData>;
};

export interface IData<T extends keyof IType = keyof IType> {
  id: string;
  entityType: "data" | "variable";
  type: T;
  value: IType[T];
  isGeneric?: boolean;
  name?: string;
  referenceId?: string;
}

export interface IMethod {
  id: string;
  name: string;
  entityType: "method";
  parameters: IStatement[];
  handler(...args: IData[]): IData;
  result: ReturnType<IMethod["handler"]>;
}

export interface IFunction {
  id: string;
  entityType: "function";
  name: string;
  parameter: IData[];
  statements: (IStatement | ICondition)[];
  result?: IData;
  handler?: (...args: IData[]) => IData;
}

export interface IStore {
  functions: IFunction[];
  setFunction: (func: IFunction, index: number) => void;
}

export interface IStatement {
  id: string;
  entityType: "statement";
  data: IData;
  methods: IMethod[];
  result: IData;
  variable?: string;
}

export interface ICondition {
  id: string;
  entityType: "condition";
  condition: IStatement;
  true: IStatement;
  false: IStatement;
  result: IData;
  variable?: string;
}
