import { StateCreator } from "zustand";
import { temporal } from "zundo";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  Context,
  INavigation,
  IStatement,
  Project,
  ProjectFile,
} from "./types";
import { preferenceOptions } from "./data";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { openDB } from "idb";
import {
  createProjectFile,
  createVariableName,
  jsonParseReviver,
  jsonStringifyReplacer,
} from "./utils";
import { NavigationEntity } from "./navigation";
import { nanoid } from "nanoid";

const IDbStore = openDB("logicflow", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("projects")) {
      db.createObjectStore("projects");
    }
    if (!db.objectStoreNames.contains("uiConfig")) {
      db.createObjectStore("uiConfig");
    }
  },
});

const createIDbStorage = <T>(storeName: string) =>
  createJSONStorage<T>(
    () => ({
      getItem: async (key) =>
        (await IDbStore)
          .get(storeName, key)
          .then((data) => data || null)
          .catch((e) => (console.error(`IndexedDB getItem error:`, e), null)),
      setItem: async (key, value) =>
        (await IDbStore).put(storeName, value, key).catch((e) => {
          console.error(`IndexedDB setItem error:`, e);
        }),
      removeItem: async (key) =>
        (await IDbStore).delete(storeName, key).catch((e) => {
          console.error(`IndexedDB removeItem error:`, e);
        }),
    }),
    { reviver: jsonParseReviver, replacer: jsonStringifyReplacer }
  );

export interface IProjectsStore {
  projects: Record<string, Project>;
  createProject: () => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id?: string) => Project | undefined;
}

export interface ICurrentProjectStore {
  currentProjectId?: string;
  setCurrentProjectId: (projectId?: string) => void;
  getCurrentProject: () => Project | undefined;
  addFile: (file: ProjectFile) => ProjectFile | undefined;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void;
  deleteFile: (fileId: string) => void;
  getFile: (fileId?: string | null) => ProjectFile | undefined;
}

type ProjectStore = IProjectsStore & ICurrentProjectStore;

const createProjectsSlice: StateCreator<
  ProjectStore,
  [],
  [],
  IProjectsStore
> = (set, get) => ({
  projects: {},
  createProject: () => {
    const createdAt = Date.now();
    const newProject: Project = {
      id: nanoid(),
      name: createVariableName({
        prefix: "New Project ",
        prev: Object.values(get().projects).map((p) => p.name),
      }),
      version: "0.0.1",
      createdAt,
      files: [createProjectFile({ name: "main", type: "operation" })],
    };
    set((state) => ({
      projects: { ...state.projects, [newProject.id]: newProject },
    }));
    return newProject;
  },
  updateProject: (id, updates) => {
    set((state) => ({
      projects: {
        ...state.projects,
        [id]: { ...state.projects[id], ...updates, updatedAt: Date.now() },
      },
    }));
  },
  deleteProject: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.projects;
      return { projects: rest };
    });
  },
  getProject: (id) => (id ? get().projects[id] : undefined),
});

const createCurrentProjectSlice: StateCreator<
  ProjectStore,
  [],
  [],
  ICurrentProjectStore
> = (set, get) => ({
  setCurrentProjectId: (projectId) => {
    useProjectStore.temporal.getState().clear();
    set({ currentProjectId: projectId });
  },
  getCurrentProject: () => {
    const { currentProjectId, projects } = get();
    return currentProjectId ? projects[currentProjectId] : undefined;
  },
  addFile: (file) => {
    const currentProject = get().getCurrentProject();
    if (!currentProject) return;
    const newFile = createProjectFile(file, currentProject.files);
    const updatedProject = {
      ...currentProject,
      files: [...currentProject.files, newFile],
      updatedAt: Date.now(),
    };
    set((state) => ({
      projects: { ...state.projects, [currentProject.id]: updatedProject },
    }));
    return newFile;
  },
  updateFile: (fileId, updates) => {
    const currentProject = get().getCurrentProject();
    if (!currentProject) return;
    const updatedAt = Date.now();
    const updatedProject = {
      ...currentProject,
      files: currentProject.files.map((file) => {
        if (file.id !== fileId) return file;
        return { ...file, ...updates, updatedAt } as ProjectFile;
      }),
      updatedAt,
    };
    set((state) => ({
      projects: { ...state.projects, [currentProject.id]: updatedProject },
    }));
  },
  deleteFile: (fileId) => {
    const currentProject = get().getCurrentProject();
    if (!currentProject) return;
    const updatedProject = {
      ...currentProject,
      files: currentProject.files.filter((file) => file.id !== fileId),
      updatedAt: Date.now(),
    };
    set((state) => ({
      projects: { ...state.projects, [currentProject.id]: updatedProject },
    }));
  },
  getFile: (fileId) => {
    const currentProject = get().getCurrentProject();
    return currentProject?.files.find((file) => file.id === fileId);
  },
});

export const useProjectStore = createWithEqualityFn(
  persist(
    temporal<ProjectStore>(
      (...a) => ({
        ...createProjectsSlice(...a),
        ...createCurrentProjectSlice(...a),
      }),
      {
        partialize: (state) => {
          if (!state.currentProjectId) return {} as ProjectStore;
          return {
            projects: { [state.currentProjectId]: state.getCurrentProject() },
          } as ProjectStore;
        },
      }
    ),
    {
      name: "projects",
      storage: createIDbStorage("projects"),
      partialize: (state) => ({ projects: state.projects }),
    }
  ),
  shallow
);

export const waitForHydration = () => {
  return new Promise<void>((resolve) => {
    if (useProjectStore.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsubscribe = useProjectStore.persist.onFinishHydration(() => {
      resolve();
      unsubscribe();
    });
  });
};

type SetUIConfig = Partial<Omit<IUiConfig, "setUiConfig">>;
export type IUiConfig = Partial<{
  [key in (typeof preferenceOptions)[number]["id"]]: boolean;
}> & {
  hideSidebar?: boolean;
  result?: IStatement["data"];
  skipExecution?: Context["skipExecution"];
  showPopup?: boolean;
  navigationEntities?: NavigationEntity[];
  navigation?: INavigation;
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
