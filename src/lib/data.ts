import { IType, IValue } from "./types";

export const TypeMapper: {
  [K in IType["kind"]]: {
    defaultValue: any;
    createType: () => Extract<IType, { kind: K }>;
  };
} = {
  undefined: {
    defaultValue: undefined,
    createType: () => ({ kind: "undefined" }),
  },
  string: {
    defaultValue: "",
    createType: () => ({ kind: "string" }),
  },
  number: {
    defaultValue: 0,
    createType: () => ({ kind: "number" }),
  },
  boolean: {
    defaultValue: false,
    createType: () => ({ kind: "boolean" }),
  },
  tuple: {
    defaultValue: [],
    createType: () => ({ kind: "tuple", elementsType: [] }),
  },
  list: {
    defaultValue: [],
    createType: () => ({ kind: "list", elementType: { kind: "undefined" } }),
  },
  object: {
    defaultValue: {},
    createType: () => ({ kind: "object", properties: {} }),
  },
  record: {
    defaultValue: new Map(),
    createType: () => ({ kind: "record", valueType: { kind: "undefined" } }),
  },
  union: {
    defaultValue: undefined,
    createType: () => ({ kind: "union", types: [] }),
  },
};

export const preferenceOptions = [
  // { id: "highlightAll", label: "Highlight all" },
  { id: "highlightOperation", label: "Highlight operations" },
  { id: "hideResultValue", label: "Hide result value" },
  { id: "displayCode", label: "Display Code" },
] as const;
