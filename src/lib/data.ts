import { IData, ITypeName } from "./types";
import { nanoid } from "nanoid";
import { createOperation } from "./utils";

export const initialData: IData = {
  id: nanoid(),
  entityType: "data",
  value: { type: "string", value: "" },
};

export const TypeMapper: Record<ITypeName, { defaultValue: IData }> = {
  string: {
    defaultValue: {
      id: nanoid(),
      entityType: "data",
      value: {
        type: "string",
        value: "",
      },
    },
  },
  number: {
    defaultValue: {
      id: nanoid(),
      entityType: "data",
      value: {
        type: "string",
        value: "",
      },
    },
  },
  array: {
    defaultValue: {
      id: nanoid(),
      entityType: "data",
      value: {
        type: "array",
        value: [],
      },
    },
  },
  object: {
    defaultValue: {
      id: nanoid(),
      entityType: "data",
      value: {
        type: "object",
        value: {},
      },
    },
  },
};

export const initialStatement = [initialData, createOperation(initialData)];
