import { create } from "zustand";
import { temporal } from "zundo";
import { createJSONStorage, persist } from "zustand/middleware";
import { IData, IStatement, OperationType } from "./types";
import { preferenceOptions } from "./data";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { openDB } from "idb";
import { createData, jsonParseReviver, jsonStringifyReplacer } from "./utils";
import {
  NavigationDirection,
  NavigationEntity,
  NavigationModifier,
} from "./navigation";
import { updateOperations } from "./update";

export interface IStore {
  operations: IData<OperationType>[];
  addOperation: (operation: IData<OperationType>) => void;
  setOperation: (operation: IData<OperationType>, remove?: boolean) => void;
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
      reviver: jsonParseReviver,
      replacer: jsonStringifyReplacer,
    }
  );

export const operationsStore = create(
  persist(
    temporal<IStore>((set) => ({
      operations: [
        createData({
          type: {
            kind: "operation",
            parameters: [],
            result: { kind: "undefined" },
          },
          value: { name: "main", parameters: [], statements: [] },
        }),
      ],
      addOperation: (operation) =>
        set((state) => ({ operations: [...state.operations, operation] })),
      setOperation: (operation, remove) => {
        set((s) => ({
          operations: updateOperations(s.operations, operation, remove),
        }));
      },
    })),
    { name: "operations", storage: createIDbStorage("operations") }
  )
);

type SetUIConfig = Partial<Omit<IUiConfig, "setUiConfig">>;
export type IUiConfig = Partial<{
  [key in (typeof preferenceOptions)[number]["id"]]: boolean;
}> & {
  hideSidebar?: boolean;
  result?: IStatement["data"];
  showPopup?: boolean;
  navigationEntities?: NavigationEntity[];
  navigation?: {
    id?: string;
    direction?: NavigationDirection;
    modifier?: NavigationModifier;
    disable?: boolean;
  };
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
