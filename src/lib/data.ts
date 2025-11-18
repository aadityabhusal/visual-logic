import { DataType, DataValue } from "./types";

export const TypeMapper: {
  [K in DataType["kind"]]: {
    defaultValue: DataValue<Extract<DataType, { kind: K }>>;
    type: Extract<DataType, { kind: K }>;
  };
} = {
  unknown: {
    defaultValue: undefined,
    type: { kind: "unknown" },
  },
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
  array: {
    defaultValue: [],
    type: { kind: "array", elementType: { kind: "undefined" } },
  },
  object: {
    defaultValue: new Map(),
    type: { kind: "object", properties: {} },
  },
  union: {
    defaultValue: undefined,
    type: { kind: "union", types: [{ kind: "undefined" }] },
  },
  operation: {
    defaultValue: { parameters: [], statements: [] },
    type: {
      kind: "operation",
      parameters: [],
      result: { kind: "undefined" },
    },
  },
  condition: {
    defaultValue: undefined as any, // can't use createStatement() because of circular dependency
    type: {
      kind: "condition",
      type: { kind: "union", types: [{ kind: "undefined" }] },
    },
  },
};

export const preferenceOptions = [
  // { id: "highlightAll", label: "Highlight all" },
  { id: "highlightOperation", label: "Highlight operations" },
  { id: "hideResultValue", label: "Hide result value" },
  { id: "displayCode", label: "Display Code" },
] as const;
