export type IType = string | number | Array<string | number>;
export type ITypeName = "string" | "number" | "array";

export type IValue = {
  type: ITypeName;
  subType?: ITypeName;
  value: IType;
};

export interface IData {
  id: string;
  entityType: "data";
  value: IValue;
}

export interface IMethod {
  name: string;
  parameters: IValue[];
  handler: (...args: any[]) => IType;
  returnType: ITypeName;
}

export interface IOperation {
  id: string;
  entityType: "operation";
  methods: IMethod[];
  selectedMethod: IMethod;
}
