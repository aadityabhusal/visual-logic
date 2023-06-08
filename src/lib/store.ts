import create from "zustand";
import { IStore } from "./types";
import { getLocalStorage } from "./utils";

export const useStore = create<IStore>((set) => ({
  operations: getLocalStorage("operations") || [],
  currentId: "",
  setCurrentId: (currentId) => set(() => ({ currentId })),
  addOperation: (operation) =>
    set((state) => {
      let operations = [...state.operations, operation];
      localStorage.setItem("operations", JSON.stringify(operations));
      return { operations };
    }),
  setOperation: (operations) =>
    set(() => {
      localStorage.setItem("operations", JSON.stringify(operations));
      return { operations };
    }),
}));
