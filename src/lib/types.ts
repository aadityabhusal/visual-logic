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
  reference?: IReference;
}

export interface IReference {
  id: string;
  name: string;
  type: "operation" | "statement";
  parameters?: IStatement[];
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
  data: IData;
  methods: IMethod[];
  result: IData;
  name?: string;
}

export interface IOperation {
  id: string;
  entityType: "operation";
  name: string;
  parameters: IData[];
  statements: IStatement[];
  result: IData;
  handler?: (...args: IData[]) => IData;
}

export interface IStore {
  operations: IOperation[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  addOperation: () => void;
  setOperation: (
    operation: IOperation,
    index: number,
    remove?: boolean
  ) => void;
}
