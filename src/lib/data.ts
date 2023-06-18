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
  { id: "highlight", label: "Highlight all" },
  { id: "highlightOperation", label: "Highlight operations" },
  { id: "hideData", label: "Hide result data" },
  { id: "displayCode", label: "Display Code" },
];
