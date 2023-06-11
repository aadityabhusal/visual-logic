import create from "zustand";
import { IStore } from "./types";
import { getLocalStorage, setLocalStorage } from "./utils";

export const useStore = create<IStore>((set) => ({
  operations: getLocalStorage("operations") || [],
  currentId: "",
  setCurrentId: (currentId) => set(() => ({ currentId })),
  addOperation: (operation) =>
    set((state) => {
      let operations = [...state.operations, operation];
      setLocalStorage("operations", operations);
      return { operations };
    }),
  setOperation: (operations) =>
    set(() => {
      setLocalStorage("operations", operations);
      return { operations };
    }),
}));
