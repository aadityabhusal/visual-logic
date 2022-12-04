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
  value: {
    type: T;
    value: IType[T];
  };
  methods: IMethod[];
  selectedMethod?: IMethod;
}

// SINCE METHOD AND OPERATIONS ARE VERY SIMILAR WITH SOME MODIFICATION IN STATEMENT AND HANDLER PROPERTIES
// WE CAN NAME THEM INTO A SINGLE TYPE: OPERATION OR FUNCTION

export interface IMethod {
  name: string;
  parameters: IData[];
  result?: IData;
  handler(...args: IData[]): IData;
  // need to add context here
  // will only have a single statement because of parameters
  // need to make several properties readonly
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
