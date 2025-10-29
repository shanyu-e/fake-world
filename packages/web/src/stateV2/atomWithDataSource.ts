import type { IDataSource } from "@/data/types/IDataSource";
import { type Getter, atom } from "jotai";

// 数据源atom配置
interface DataSourceAtomConfig<T> {
  key: string;
  initialValue: T;
  getDataSource: (get: Getter) => IDataSource<T>;
  syncOnMount?: boolean;
  syncInterval?: number;
}

// 创建支持数据源的atom
export function atomWithDataSource<T>(config: DataSourceAtomConfig<T>) {
  const { key, initialValue, getDataSource, syncOnMount = true, syncInterval } = config;

  // 基础atom
  const baseAtom = atom(initialValue);

  // 加载状态atom
  const loadingAtom = atom(false);

  // 错误状态atom
  const errorAtom = atom<string | null>(null);

  // 数据同步atom
  const syncAtom = atom(
    (get) => get(baseAtom),
    async (get, set, action: any) => {
      set(loadingAtom, true);
      set(errorAtom, null);

      try {
        let newValue: T;

        if (typeof action === "function") {
          const currentValue = get(baseAtom);
          newValue = action(currentValue);
        } else {
          newValue = action;
        }

        // 更新本地状态
        set(baseAtom, newValue);

        // 同步到数据源
        if (typeof action === "function") {
          // 如果是函数更新，需要先获取当前值
          const currentValue = get(baseAtom);
          await getDataSource(get).update(key, currentValue);
        } else {
          // 直接更新
          await getDataSource(get).update(key, newValue);
        }
      } catch (error) {
        console.error(`Error syncing data for key ${key}:`, error);
        set(errorAtom, error instanceof Error ? error.message : "Unknown error");
      } finally {
        set(loadingAtom, false);
      }
    }
  );

  // 数据加载atom
  const loadAtom = atom(null, async (get, set) => {
    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      const data = await getDataSource(get).getAll();
      if (Array.isArray(initialValue)) {
        // Collection atom
        if (Array.isArray(data)) {
          set(baseAtom, data as T);
        } else {
          console.error("Data format error: expected an array, got", data);
          set(errorAtom, "Data format error: expected an array.");
          set(baseAtom, [] as unknown as T); // 安全地设置为空数组
        }
      } else {
        // Single item atom
        if (Array.isArray(data) && data.length > 0) {
          set(baseAtom, data[0]);
        } else {
          set(baseAtom, data as T);
        }
      }
    } catch (error: any) {
      console.error(`Error loading data for key ${key}:`, error);
      set(errorAtom, error instanceof Error ? error.message : "Unknown error");
    } finally {
      set(loadingAtom, false);
    }
  });

  // 数据创建atom
  const createAtom = atom(null, async (get, set, data: Omit<T, "id">) => {
    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      const newItem = await getDataSource(get).create(data);
      set(baseAtom, newItem);
      return newItem;
    } catch (error) {
      console.error(`Error creating data for key ${key}:`, error);
      set(errorAtom, error instanceof Error ? error.message : "Unknown error");
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  // 数据删除atom
  const deleteAtom = atom(null, async (get, set, id: string) => {
    set(loadingAtom, true);
    set(errorAtom, null);

    try {
      await getDataSource(get).delete(id);
      // 重置为初始值
      set(baseAtom, initialValue);
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
      set(errorAtom, error instanceof Error ? error.message : "Unknown error");
      throw error;
    } finally {
      set(loadingAtom, false);
    }
  });

  // 如果启用挂载时同步，自动加载数据
  if (syncOnMount) {
    // 这里可以添加自动加载逻辑
    // 由于atom的初始化是同步的，我们可能需要一个effect来处理异步加载
  }

  // 如果设置了同步间隔，添加定时同步
  if (syncInterval && syncInterval > 0) {
    // 这里可以添加定时同步逻辑
    // 由于atom本身不支持定时器，这需要在组件层面处理
  }

  return {
    baseAtom,
    loadingAtom,
    errorAtom,
    atom: syncAtom,
    loadAtom,
    createAtom,
    deleteAtom,
  };
}

// 简化的数据源atom创建函数
export function createDataSourceAtom<T>(
  key: string,
  initialValue: T,
  getDataSource: (get: Getter) => IDataSource<T>,
  options: {
    syncOnMount?: boolean;
    syncInterval?: number;
  } = {}
) {
  return atomWithDataSource({
    key,
    initialValue,
    getDataSource,
    ...options,
  });
}
