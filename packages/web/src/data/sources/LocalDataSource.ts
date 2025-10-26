import type { IDataSource } from "../types/IDataSource";

export class LocalDataSource<T> implements IDataSource<T> {
	constructor(private key: string) {}

	async get(id: string): Promise<T> {
		const allData = this.getAllFromStorage();
		const item = allData.find((item: any) => item.id === id);
		if (!item) {
			throw new Error(`Item with id ${id} not found`);
		}
		return item;
	}

	async getAll(): Promise<T[]> {
		const allData = this.getAllFromStorage();
		return allData || [];
	}

	async create(data: Omit<T, "id">): Promise<T> {
		const allData = this.getAllFromStorage();
		const newItem = {
			...data,
			id: crypto.randomUUID(),
		} as T;

		allData.push(newItem);
		this.saveToStorage(allData);
		return newItem;
	}

	async update(id: string, data: Partial<T>): Promise<T> {
		const allData = this.getAllFromStorage();
		const index = allData.findIndex((item: any) => item.id === id);

		if (index === -1) {
			throw new Error(`Item with id ${id} not found`);
		}

		allData[index] = { ...allData[index], ...data };
		this.saveToStorage(allData);
		return allData[index];
	}

	async delete(id: string): Promise<void> {
		const allData = this.getAllFromStorage();
		const filteredData = allData.filter((item: any) => item.id !== id);
		this.saveToStorage(filteredData);
	}

	private getAllFromStorage(): T[] {
		try {
			const stored = localStorage.getItem(this.key);
			return stored ? JSON.parse(stored) : [];
		} catch (error) {
			console.error(`Error reading from localStorage for key ${this.key}:`, error);
			return [];
		}
	}

	private saveToStorage(data: T[]): void {
		try {
			localStorage.setItem(this.key, JSON.stringify(data));
		} catch (error) {
			console.error(`Error saving to localStorage for key ${this.key}:`, error);
		}
	}
}
