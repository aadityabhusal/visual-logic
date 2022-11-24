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
