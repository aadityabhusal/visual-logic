import create from "zustand";
import { IStore } from "./types";
import { createFunction } from "./utils";

export const useStore = create<IStore>((set) => ({
  functions: [createFunction()],
  setFunction: (func, index) =>
    set((state) => {
      const funcs = [...state.functions];
      funcs[index] = func;
      return { functions: funcs };
    }),
}));
