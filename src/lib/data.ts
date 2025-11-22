import { DataType } from "./types";

export const DataTypes: {
  [K in DataType["kind"]]: {
    type: Extract<DataType, { kind: K }>;
    hideFromDropdown?: boolean;
  };
} = {
  unknown: {
    type: { kind: "unknown" },
    hideFromDropdown: true,
  },
  undefined: {
    type: { kind: "undefined" },
  },
  string: {
    type: { kind: "string" },
  },
  number: {
    type: { kind: "number" },
  },
  boolean: {
    type: { kind: "boolean" },
  },
  array: {
    type: { kind: "array", elementType: { kind: "undefined" } },
  },
  object: {
    type: { kind: "object", properties: { key: { kind: "undefined" } } },
  },
  union: {
    type: { kind: "union", types: [{ kind: "undefined" }] },
  },
  operation: {
    type: {
      kind: "operation",
      parameters: [],
      result: { kind: "undefined" },
    },
  },
  condition: {
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
