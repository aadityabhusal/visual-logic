export type IType = {
  string: string;
  number: number;
  boolean: boolean;
  array: IStatement[];
  object: Map<string, IStatement>;
};

export interface IData<T extends keyof IType = keyof IType> {
  id: string;
  entityType: "data";
  type: T;
  value: IType[T];
  reference?: {
    id: string;
    name: string;
  };
}

export interface IMethod {
  id: string;
  name: string;
  entityType: "method";
  parameters: IStatement[];
  handler(...args: IStatement["data"][]): IStatement["data"];
  result: ReturnType<IMethod["handler"]>;
}

export interface IStatement {
  id: string;
  entityType: "statement";
  data: IData | IOperation;
  methods: IMethod[];
  name?: string;
  metadata: {
    disableName?: boolean;
    disableNameToggle?: boolean;
    disableDelete?: boolean;
    disableMethods?: boolean;
    isGeneric?: boolean;
  };
}

export interface IOperation {
  id: string;
  entityType: "operation";
  name: string;
  parameters: IStatement[];
  closure: IStatement[];
  statements: IStatement[];
  handler?: (...args: IData[]) => IData;
  reference?: {
    id: string;
    name: string;
    isCalled?: boolean;
  };
}

export interface IStore {
  operations: IOperation[];
  currentId: string;
  setCurrentId: (id: string) => void;
  addOperation: (operation: IOperation) => void;
  setOperation: (operations: IOperation[]) => void;
}
