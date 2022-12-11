import create from "zustand";
import { globalContext } from "./data";
import { IStore } from "./types";
import { createFunction } from "./utils";

const mainFunction = createFunction({ context: globalContext });

export const useStore = create<IStore>((set) => ({
  functions: {
    [mainFunction.id]: mainFunction,
  },
  context: {},
  setFunction: (id, func) =>
    set((state) => ({ functions: { ...state.functions, [id]: func } })),
}));
