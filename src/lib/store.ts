import { create } from "zustand";
import { temporal } from "zundo";
import { persist } from "zustand/middleware";
import { IOperation } from "./types";
import { preferenceOptions } from "./data";

export interface IStore {
  operations: IOperation[];
  addOperation: (operation: IOperation) => void;
  setOperation: (operations: IOperation[]) => void;
}

export const useStore = create(
  persist(
    temporal<IStore>((set) => ({
      operations: [],
      addOperation: (operation) =>
        set((state) => ({ operations: [...state.operations, operation] })),
      setOperation: (operations) => set(() => ({ operations })),
    })),
    { name: "operations" }
  )
);

type IUiConfig = Partial<{
  [key in (typeof preferenceOptions)[number]["id"]]: boolean;
}> & {
  hideSidebar?: boolean;
  selectedOperationId?: string;
  setUiConfig: (change: Partial<Omit<IUiConfig, "setUiConfig">>) => void;
};

export const uiConfigStore = create(
  persist<IUiConfig>((set) => ({ setUiConfig: (data) => set({ ...data }) }), {
    name: "uiConfig",
  })
);
