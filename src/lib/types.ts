export type IType = {
  string: string;
  number: number;
  array: IData[];
  object: Map<string, IData>;
};

export interface IData<T extends keyof IType = keyof IType> {
  id: string;
  entityType: "data" | "variable";
  type: T;
  value: IType[T];
  name?: string;
  referenceId?: string;
}

// Can make function and method into a single type because of their similarity
// but need to separated Function definition (IFunction) with function call (IMethod)

export interface IMethod {
  id: string;
  name: string;
  entityType: "method";
  parameters: IData[];
  handler(...args: IData[]): IData;
  result: ReturnType<IMethod["handler"]>;
}

export interface IFunction {
  id: string;
  entityType: "function";
  name: string;
  parameter: IData[];
  statements: IStatement[];
  return?: IData;
  handler?: (...args: IData[]) => IData;
}

export interface IStore {
  functions: IFunction[];
  setFunction: (func: IFunction, index: number) => void;
}

export interface IStatement {
  id: string;
  entities: (IData | IMethod)[];
  return: IData;
  variable?: string;
}
