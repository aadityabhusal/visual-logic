export type IType = string | number | IData[] | Map<string, IData>;
export type ITypeName = "string" | "number" | "array" | "object";

export type IValue<V = string, T = "string"> = {
  type: T;
  value: V;
};

export interface IData {
  id: string;
  entityType: "data";
  value: IValue<IType, ITypeName>;
}

export interface IMethod {
  name: string;
  parameters: IValue<IType, ITypeName>[];
  handler: (...args: any[]) => IValue<IType, ITypeName>; // @todo: multiple params type issue
}

export interface IOperation {
  id: string;
  entityType: "operation";
  methods: IMethod[];
  selectedMethod: IMethod;
}
