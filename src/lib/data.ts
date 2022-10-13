import { IData, ITypeName, ITypeConstructor, IType } from "./types";
import { nanoid } from "nanoid";
import { createOperation } from "./utils";
import { Input } from "../components/Input/Input";
import { ArrayInput } from "../components/Input/ArrayInput";

export const initialData: IData = {
  id: nanoid(),
  entityType: "data",
  value: { type: "string", value: "" },
};

export const TypeMapper: Record<
  ITypeName,
  {
    constructor: ITypeConstructor;
    component: Function;
    value: IType;
  }
> = {
  string: {
    constructor: String,
    component: Input,
    value: "",
  },
  number: {
    constructor: Number,
    component: Input,
    value: 0,
  },
  array: {
    constructor: Array,
    component: ArrayInput,
    value: [],
  },
};

export const initialStatement = [initialData, createOperation(initialData)];
