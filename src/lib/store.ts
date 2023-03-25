import create from "zustand";
import { IStore } from "./types";
import { updateOperations } from "./update";
import { createOperation } from "./utils";

export const useStore = create<IStore>((set) => ({
  operations: [createOperation()],
  currentIndex: -1,
  setCurrentIndex: (index) => set((state) => ({ currentIndex: index })),
  addOperation: () =>
    set((state) => ({ operations: [...state.operations, createOperation()] })),
  setOperation: (operation, index, remove) =>
    set((state) => {
      const operations = updateOperations(
        state.operations,
        operation,
        index,
        remove
      );
      return { operations };
    }),
}));
