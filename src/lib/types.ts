export type IType = {
  string: string;
  number: number;
  array: IData<keyof IType>[];
  object: Map<string, IData<keyof IType>>;
};

export interface IData<T extends keyof IType> {
  id: string;
  entityType: "data";
  value: {
    type: T;
    value: IType[T];
  };
}

export interface IMethod {
  name: string;
  parameters: IData<keyof IType>[];
  handler: (...args: any[]) => IData<keyof IType>; // @todo: multiple params type issue
}

export interface IOperation {
  id: string;
  entityType: "operation";
  methods: IMethod[];
  selectedMethod: IMethod;
}
