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
  statements: IStatement[];
  result?: IData;
  handler?: (...args: IData[]) => IData;
}

export interface IStore {
  functions: IFunction[];
  addFunction: () => void;
  removeFunction: (id: string) => void;
  setFunction: (func: IFunction) => void;
}

export interface IStatement {
  id: string;
  entityType: "statement";
  data: IData;
  methods: IMethod[];
  result: IData;
  variable?: string;
}
