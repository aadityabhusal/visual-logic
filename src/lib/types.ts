export type IType = {
  string: string;
  number: number;
  boolean: boolean;
  array: IData[];
  object: Map<string, IData>;
};

export interface IData<T extends keyof IType = keyof IType> {
  id: string;
  entityType: "data";
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

export interface IOperation {
  id: string;
  entityType: "operation";
  name: string;
  parameter: IData[];
  statements: IStatement[];
  result: IData;
  handler?: (...args: IData[]) => IData;
}

export interface IStore {
  operations: IOperation[];
  addOperation: () => void;
  removeOperation: (id: string) => void;
  setOperation: (operation: IOperation) => void;
}

export interface IStatement {
  id: string;
  entityType: "statement";
  data: IData;
  methods: IMethod[];
  result: IData;
  variable?: string;
}
