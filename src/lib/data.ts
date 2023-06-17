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
  { id: "hideOperation", label: "Hide operation code" },
  { id: "hideData", label: "Hide data value" },
  { id: "displayCode", label: "Display Code" },
];
