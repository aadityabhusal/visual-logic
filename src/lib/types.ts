import { ChangeEventHandler } from "react";

export type IValue = string | number;
export type IValueConstructor = StringConstructor | NumberConstructor;
export type IValueObject = String | Number;

export interface IInput {
  value: IValue;
  onChange: ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
}

export interface IData {
  id: string;
  entityType: "data";
  value: IValue;
}

export interface IMethod {
  name: string;
  parameters: IValue[];
  handler: Function;
}

export interface IOperation {
  id: string;
  entityType: "operation";
  methods: IMethod[];
  selectedMethod: IMethod;
}
