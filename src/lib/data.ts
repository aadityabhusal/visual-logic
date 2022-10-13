import { IData, ITypeName, IType } from "./types";
import { nanoid } from "nanoid";
import { createOperation } from "./utils";

export const initialData: IData = {
  id: nanoid(),
  entityType: "data",
  value: { type: "string", value: "" },
};

export const TypeMapper: Record<ITypeName, { defaultValue: IType }> = {
  string: {
    defaultValue: "",
  },
  number: {
    defaultValue: 0,
  },
  array: {
    defaultValue: [],
  },
};

export const initialStatement = [initialData, createOperation(initialData)];
