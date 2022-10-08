export type IValue = string | number;
export type IValueConstructor = StringConstructor | NumberConstructor;

export interface IData {
  id: string;
  entityType: "data";
  value: IValue;
}

export interface IMethod {
  name: string;
  handler: (value: IValue) => IValue;
}

export interface IOperation {
  id: string;
  entityType: "operation";
  name: string;
  inputType: IValue;
  methods: IMethod[];
}
