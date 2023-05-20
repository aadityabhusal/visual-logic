import create from "zustand";
import { IStore } from "./types";
import { updateOperations } from "./update";
import { createOperation } from "./utils";

export const useStore = create<IStore>((set) => ({
  operations: [createOperation(undefined, true)],
  currentId: "",
  setCurrentId: (currentId) => set(() => ({ currentId })),
  addOperation: () =>
    set((state) => ({
      operations: [...state.operations, createOperation(undefined, true)],
    })),
  setOperation: (operation, remove) =>
    set((state) => {
      const operations = updateOperations(state.operations, operation, remove);
      return { operations };
    }),
}));
