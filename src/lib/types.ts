export type IInput = string | number;
export type IOutput = string | number | boolean;

export interface IData {
  id: string;
  entityType: "data";
  value: IInput;
}

export interface IMethod {
  name: string;
  handler: (value: IInput) => IOutput;
}

export interface IOperation {
  id: string;
  entityType: "operation";
  name: string;
  inputType: IInput;
  methods: IMethod[];
}
