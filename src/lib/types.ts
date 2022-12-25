export type IType = {
  string: string;
  number: number;
  array: IData[];
  object: Map<string, IData>;
};

export interface IData<T extends keyof IType = keyof IType> {
  id: string;
  entityType: "data" | "variable";
  variable?: string;
  type: T;
  value: IType[T];
  selectedMethod?: IMethod;
  name?: string;
  return: {
    type: T;
    value: IType[T];
  };
  referenceId?: string;
}

// @todo
export interface IOperation {
  id: string;
  entityType: "function" | "method";
  variable?: string;
  name: string;
  parameter: IData[];
  statements?: IData[]; // only for function
  return?: IData;
  referenceId?: string; // only for method
  handler?: (...args: IData[]) => IData;
}

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
  statements: IData[];
  return?: IData;
  handler?: (...args: IData[]) => IData;
}

export interface IStore {
  functions: IFunction[];
  setFunction: (func: IFunction, index: number) => void;
  dropdown: {
    display: boolean;
    targetRef?: React.RefObject<HTMLDivElement>;
    data?: IData;
    method?: IMethod;
    options?: { id: string; name: string }[];
    position?: { top: number; left: number };
    context?: IContextProps;
    toggleVariable?: (data: IData, remove: boolean) => void;
    addMethod?: () => void;
    showResultData?: () => void;
    selectOption?: (option: { id: string; name: string }, data: IData) => void;
    handleDelete?: () => void;
  };
  setDropdown: (tooltip: IStore["dropdown"]) => void;
}

export interface IContextProps extends IFunction {
  parent?: IContextProps;
}
