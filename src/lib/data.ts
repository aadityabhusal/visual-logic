import { IData, IValue, IValueConstructor } from "./types";
import { nanoid } from "nanoid";
import { createOperation } from "./utils";

export const initialData: IData = {
  id: nanoid(),
  entityType: "data",
  value: "",
};

export const typeToObject: Record<IValue, IValueConstructor> = {
  number: Number,
  string: String,
};

export const initialStatement = [initialData, createOperation(initialData)];
