export type IType = {
  string: string;
  number: number;
  array: IData[];
  object: Map<string, IData>;
};

export interface IData<T extends keyof IType = keyof IType> {
  id: string;
  entityType: "data";
  value: {
    type: T;
    value: IType[T];
  };
}

export interface IMethod {
  name: string;
  parameters: IData[];
  handler: (...args: any[]) => IData; // @todo: multiple params type issue
}

export interface IOperation {
  id: string;
  entityType: "operation";
  methods: IMethod[];
  selectedMethod: IMethod;
}

export interface IFunction {
  id: string;
  entityType: "function";
  name: string;
  parameter: IData[];
  context: any; // global and local context
  statements: IData[];
  return: IData;
  handler?: (...args: IData[]) => IData; // handler optional for function
}
