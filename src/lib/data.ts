import { IData, IInput, IValue, IValueConstructor } from "./types";
import { nanoid } from "nanoid";
import { createOperation } from "./utils";
import { FC } from "react";
import { Input } from "../components/Input";

export const initialData: IData = {
  id: nanoid(),
  entityType: "data",
  value: "",
};

export const typeToObject: Record<IValue, IValueConstructor> = {
  number: Number,
  string: String,
};

export const typeToComponent: Record<IValue, FC<IInput>> = {
  number: Input,
  string: Input,
};

export const initialStatement = [initialData, createOperation(initialData)];
