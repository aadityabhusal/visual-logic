import { create } from "zustand";
import { temporal } from "zundo";
import { createJSONStorage, persist } from "zustand/middleware";
import { IOperation, IStatement } from "./types";
import { preferenceOptions } from "./data";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { openDB } from "idb";
import { createOperation } from "./utils";

export interface IStore {
  operations: IOperation[];
  addOperation: (operation: IOperation) => void;
  setOperation: (operations: IOperation[]) => void;
}

const IDbStore = openDB("logicFlow", 1, {
  upgrade(db) {
    db.createObjectStore("operations");
    db.createObjectStore("uiConfig");
  },
});

const createIDbStorage = <T>(storeName: string) =>
  createJSONStorage<T>(
    () => ({
      getItem: async (key) => (await IDbStore).get(storeName, key) || null,
      setItem: async (key, value) =>
        (await IDbStore).put(storeName, value, key),
      removeItem: async (key) => (await IDbStore).delete(storeName, key),
    }),
    {
      reviver: (_, data: any) => {
        return typeof data === "object" && data.type === "object"
          ? { ...data, value: new Map(data.value as []) }
          : data;
      },
      replacer: (_key, value) => {
        return value instanceof Map ? Array.from(value.entries()) : value;
      },
    }
  );

export const operationsStore = create(
  persist(
    temporal<IStore>((set) => ({
      operations: [createOperation({ name: "main" })],
      addOperation: (operation) =>
        set((state) => ({ operations: [...state.operations, operation] })),
      setOperation: (operations) => set(() => ({ operations })),
    })),
    { name: "operations", storage: createIDbStorage("operations") }
  )
);

type SetUIConfig = Partial<Omit<IUiConfig, "setUiConfig">>;
type IUiConfig = Partial<{
  [key in (typeof preferenceOptions)[number]["id"]]: boolean;
}> & {
  hideSidebar?: boolean;
  selectedOperationId?: string;
  focusId?: string;
  result?: IStatement["data"];
  showPopup?: boolean;
  setUiConfig: (
    change: SetUIConfig | ((change: SetUIConfig) => SetUIConfig)
  ) => void;
};

export const uiConfigStore = createWithEqualityFn(
  persist<IUiConfig>(
    (set) => ({
      setUiConfig: (change) =>
        set((state) => (typeof change === "function" ? change(state) : change)),
    }),
    { name: "uiConfig", storage: createIDbStorage("uiConfig") }
  ),
  shallow
);
