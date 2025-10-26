import { atom } from "jotai";

const STORAGE_KEY = "dataSourceConfig";

const getInitialConfig = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load data source config:", error);
  }
  return { mode: import.meta.env.VITE_DATA_SOURCE_MODE || "local" };
};

export const dataSourceConfigAtom = atom(getInitialConfig());

export const setDataSourceModeAtom = atom(
  null,
  (get, set, mode: "local" | "remote" | "hybrid") => {
    const config = get(dataSourceConfigAtom);
    const newConfig = { ...config, mode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    set(dataSourceConfigAtom, newConfig);
  }
);