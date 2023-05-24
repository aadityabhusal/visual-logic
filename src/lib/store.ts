import create from "zustand";
import { IStore } from "./types";

export const useStore = create<IStore>((set) => ({
  operations: [],
  currentId: "",
  setCurrentId: (currentId) => set(() => ({ currentId })),
  addOperation: (operation) =>
    set((state) => ({
      operations: [...state.operations, operation],
    })),
  setOperation: (operations) => set(() => ({ operations })),
}));
