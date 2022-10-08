export type IValue = string | number;
export type IValueConstructor = StringConstructor | NumberConstructor;
export type IValueObject = String | Number;

export interface IData {
  id: string;
  entityType: "data";
  value: IValue;
}

export interface IMethod {
  name: string;
  return: IValue;
}

export interface IOperation {
  id: string;
  entityType: "operation";
  methods: (keyof IValueObject)[];
  selectedMethod: keyof IValueObject;
}
