import create from "zustand";
import { IStore } from "./types";
import { createOperation } from "./utils";

export const useStore = create<IStore>((set) => ({
  operations: [createOperation()],
  addOperation: () =>
    set((state) => ({ operations: [...state.operations, createOperation()] })),
  removeOperation: (id: string) => {
    set((state) => {
      let operations = state.operations.filter(
        (operation) => operation.id !== id
      );
      return { operations };
    });
  },
  setOperation: (operation) =>
    set((state) => {
      const operations = state.operations.map((item) =>
        item.id === operation.id ? operation : item
      );
      return { operations };
    }),
}));
