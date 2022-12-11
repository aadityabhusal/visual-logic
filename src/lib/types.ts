export type IType = {
  string: string;
  number: number;
  array: IData[];
  object: Map<string, IData>;
};

export interface IData<T extends keyof IType = keyof IType> {
  id: string;
  entityType: "data";
  variable?: string;
  type: T;
  value: IType[T];
  methods: IMethod[];
  selectedMethod?: IMethod;
}

// Can make function and method into a single type because of their similarity
// but need to separated Function definition (IFunction) with function call (IMethod)

export interface IMethod {
  name: string;
  parameters: IData[];
  result?: IData;
  handler(...args: IData[]): IData;
}

export interface IFunction {
  id: string;
  entityType: "function";
  name: string;
  parameter: IData[];
  context: Record<string, IData>;
  statements: IData[];
  return?: IData;
  handler?: (...args: IData[]) => IData; // handler optional for function
}

export interface IStore {
  functions: Record<string, IFunction>;
  context?: IFunction["context"];
  setFunction: (id: string, func: IFunction) => void;
}
