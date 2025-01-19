import { create } from "zustand";
import { temporal } from "zundo";
import { createJSONStorage, persist } from "zustand/middleware";
import { IOperation, IStatement } from "./types";
import { preferenceOptions } from "./data";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { get, set, del, createStore } from "idb-keyval";
import { createOperation } from "./utils";

export interface IStore {
  operations: IOperation[];
  addOperation: (operation: IOperation) => void;
  setOperation: (operations: IOperation[]) => void;
}

const idbStore = createStore("visualLogic", "operations");
const storage = createJSONStorage(
  () => ({
    getItem: async (name: string) => (await get(name, idbStore)) || null,
    setItem: async (name: string, value: string) =>
      await set(name, value, idbStore),
    removeItem: async (name: string) => await del(name, idbStore),
  }),
  {
    reviver: (_, data: any) => {
      return data.type === "object"
        ? { ...data, value: new Map(data.value as []) }
        : data;
    },
    replacer: (_key, value) => {
      return value instanceof Map ? Array.from(value.entries()) : value;
    },
  }
);

export const useStore = create(
  persist(
    temporal<IStore>((set) => ({
      operations: [createOperation({ name: "main" })],
      addOperation: (operation) =>
        set((state) => ({ operations: [...state.operations, operation] })),
      setOperation: (operations) => set(() => ({ operations })),
    })),
    { name: "operations", storage }
  )
);

type IUiConfig = Partial<{
  [key in (typeof preferenceOptions)[number]["id"]]: boolean;
}> & {
  hideSidebar?: boolean;
  selectedOperationId?: string;
  setUiConfig: (change: Partial<Omit<IUiConfig, "setUiConfig">>) => void;
};

export const uiConfigStore = createWithEqualityFn(
  persist<IUiConfig>((set) => ({ setUiConfig: (data) => set({ ...data }) }), {
    name: "uiConfig",
  }),
  shallow
);

export type IFocusStore = {
  focusId?: string;
  result?: IStatement["data"];
  showPopup?: boolean;
  setFocus: (
    change:
      | Omit<IFocusStore, "setFocus">
      | ((
          change: Omit<IFocusStore, "setFocus">
        ) => Omit<IFocusStore, "setFocus">)
  ) => void;
};
export const focusStore = createWithEqualityFn<IFocusStore>(
  (set) => ({
    setFocus: (change) =>
      set((s) => (typeof change === "function" ? change(s) : change)),
  }),
  shallow
);
