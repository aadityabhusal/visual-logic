import { DataType, DataValue } from "./types";

export const TypeMapper: {
  [K in DataType["kind"]]: {
    defaultValue: DataValue<Extract<DataType, { kind: K }>>;
    type: Extract<DataType, { kind: K }>;
  };
} = {
  undefined: {
    defaultValue: undefined,
    type: { kind: "undefined" },
  },
  string: {
    defaultValue: "",
    type: { kind: "string" },
  },
  number: {
    defaultValue: 0,
    type: { kind: "number" },
  },
  boolean: {
    defaultValue: false,
    type: { kind: "boolean" },
  },
  tuple: {
    defaultValue: [],
    type: { kind: "tuple", elementsType: [] },
  },
  list: {
    defaultValue: [],
    type: { kind: "list", elementType: { kind: "undefined" } },
  },
  object: {
    defaultValue: new Map(),
    type: { kind: "object", properties: {} },
  },
  record: {
    defaultValue: new Map(),
    type: { kind: "record", valueType: { kind: "undefined" } },
  },
  union: {
    defaultValue: undefined,
    type: { kind: "union", types: [{ kind: "undefined" }] },
  },
};

export const preferenceOptions = [
  // { id: "highlightAll", label: "Highlight all" },
  { id: "highlightOperation", label: "Highlight operations" },
  { id: "hideResultValue", label: "Hide result value" },
  { id: "displayCode", label: "Display Code" },
] as const;
