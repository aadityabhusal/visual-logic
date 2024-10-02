import { IType } from "./types";

export const TypeMapper: {
  [T in keyof IType]: { defaultValue: IType[T] };
} = {
  string: {
    defaultValue: "",
  },
  number: {
    defaultValue: 0,
  },
  boolean: {
    defaultValue: false,
  },
  array: {
    defaultValue: [],
  },
  object: {
    defaultValue: new Map(),
  },
};

export const preferenceOptions = [
  { id: "highlightAll", label: "Highlight all" },
  { id: "highlightOperation", label: "Highlight operations" },
  { id: "hideResultValue", label: "Hide result value" },
  { id: "displayCode", label: "Display Code" },
] as const;
