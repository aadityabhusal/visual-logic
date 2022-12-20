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
  statements: IData[];
  return?: IData;
  handler?: (...args: IData[]) => IData;
}

export interface IStore {
  functions: IFunction[];
  setFunction: (func: IFunction, index: number) => void;
}

export interface IContextProps extends IFunction {
  parent?: IContextProps;
}

/** Tasks
 * - When the variable is used, its data value should be the result of the last operation
 * - When the type of a variable changes the methods the methods should show error instead of getting removes
 *    this will show user what has changed and what is wrong instead of doing things under the hood
 */
