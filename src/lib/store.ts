import create from "zustand";
import { IStore } from "./types";
import { createFunction } from "./utils";

const mainFunction = createFunction();

export const useStore = create<IStore>((set) => ({
  functions: {
    [mainFunction.id]: mainFunction,
  },
  context: {},
  setFunction: (id, func) =>
    set((state) => ({ functions: { ...state.functions, [id]: func } })),
}));
