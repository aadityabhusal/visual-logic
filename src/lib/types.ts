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
  handler(...args: IData[]): IData;
  result: ReturnType<IMethod["handler"]>;
}

export interface IStatement {
  id: string;
  entityType: "statement";
  data: IData | IOperation;
  methods: IMethod[];
  name?: string;
}

export interface IOperation {
  id: string;
  entityType: "operation";
  name: string;
  parameters: IStatement[];
  statements: IStatement[];
  handler?: (...args: IData[]) => IData;
  reference?: {
    id: string;
    name: string;
    call?: boolean;
  };
}

export interface IStore {
  operations: IOperation[];
  currentId: string;
  setCurrentId: (id: string) => void;
  addOperation: () => void;
  setOperation: (operation: IOperation, remove?: boolean) => void;
}
