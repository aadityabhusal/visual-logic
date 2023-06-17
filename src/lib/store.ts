import create from "zustand";
import { IOperation } from "./types";
import { getLocalStorage, setLocalStorage } from "./utils";

export interface IStore {
  operations: IOperation[];
  currentId: string;
  setCurrentId: (id: string) => void;
  addOperation: (operation: IOperation) => void;
  setOperation: (operations: IOperation[]) => void;
  preferences: { [id: string]: boolean };
  setPreferences: (preference: IStore["preferences"]) => void;
}

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
  preferences: getLocalStorage("preferences") || {},
  setPreferences: (preference) =>
    set((state) => {
      let preferences = { ...state.preferences, ...preference };
      setLocalStorage("preferences", preferences);
      return { preferences };
    }),
}));
