import create from "zustand";
import { IStore } from "./types";
import { createFunction } from "./utils";

export const useStore = create<IStore>((set) => ({
  functions: [createFunction()],
  addFunction: () =>
    set((state) => ({ functions: [...state.functions, createFunction()] })),
  removeFunction: (id: string) => {
    set((state) => {
      let functions = state.functions.filter((func) => func.id !== id);
      return { functions };
    });
  },
  setFunction: (func) =>
    set((state) => {
      const functions = state.functions.map((item) =>
        item.id === func.id ? func : item
      );
      return { functions };
    }),
}));
