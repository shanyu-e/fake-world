import type { IDataSource } from "../types/IDataSource";
import { LocalDataSource } from "./LocalDataSource";
import { RemoteDataSource } from "./RemoteDataSource";

export class HybridDataSource<T> implements IDataSource<T> {
	private localDataSource: LocalDataSource<T>;
	private remoteDataSource: RemoteDataSource<T>;
	private syncInProgress = false;

	constructor(
		private key: string,
		private endpoint: string,
		private options: {
			syncOnRead?: boolean;
			syncOnWrite?: boolean;
			offlineMode?: boolean;
		} = {},
	) {
		this.localDataSource = new LocalDataSource<T>(key);
		this.remoteDataSource = new RemoteDataSource<T>(endpoint);
	}

	async get(id: string): Promise<T> {
		try {
			// 优先从本地获取
			const localData = await this.localDataSource.get(id);

			// 如果启用同步读取，尝试从远程同步
			if (this.options.syncOnRead && !this.options.offlineMode) {
				this.syncInBackground();
			}

			return localData;
		} catch (error) {
			// 本地没有数据，尝试从远程获取
			if (!this.options.offlineMode) {
				try {
					const remoteData = await this.remoteDataSource.get(id);
					// 保存到本地缓存
					await this.localDataSource.update(id, remoteData);
					return remoteData;
				} catch (remoteError) {
					console.error("Both local and remote data unavailable:", remoteError);
					throw error;
				}
			}
			throw error;
		}
	}

	async getAll(): Promise<T[]> {
		try {
			// 优先从本地获取
			const localData = await this.localDataSource.getAll();

			// 如果启用同步读取，尝试从远程同步
			if (this.options.syncOnRead && !this.options.offlineMode) {
				this.syncInBackground();
			}

			return localData;
		} catch (error) {
			// 本地没有数据，尝试从远程获取
			if (!this.options.offlineMode) {
				try {
					const remoteData = await this.remoteDataSource.getAll();
					// 保存到本地缓存
					await this.saveAllToLocal(remoteData);
					return remoteData;
				} catch (remoteError) {
					console.error("Both local and remote data unavailable:", remoteError);
					throw error;
				}
			}
			throw error;
		}
	}

	async create(data: Omit<T, "id">): Promise<T> {
		try {
			// 先保存到本地
			const localResult = await this.localDataSource.create(data);

			// 如果启用同步写入，尝试同步到远程
			if (this.options.syncOnWrite && !this.options.offlineMode) {
				try {
					await this.remoteDataSource.create(data);
				} catch (remoteError) {
					console.warn("Failed to sync create to remote:", remoteError);
					// 继续使用本地数据
				}
			}

			return localResult;
		} catch (error) {
			console.error("Failed to create data:", error);
			throw error;
		}
	}

	async update(id: string, data: Partial<T>): Promise<T> {
		try {
			// 先更新本地
			const localResult = await this.localDataSource.update(id, data);

			// 如果启用同步写入，尝试同步到远程
			if (this.options.syncOnWrite && !this.options.offlineMode) {
				try {
					await this.remoteDataSource.update(id, data);
				} catch (remoteError) {
					console.warn("Failed to sync update to remote:", remoteError);
					// 继续使用本地数据
				}
			}

			return localResult;
		} catch (error) {
			console.error("Failed to update data:", error);
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		try {
			// 先删除本地
			await this.localDataSource.delete(id);

			// 如果启用同步写入，尝试同步到远程
			if (this.options.syncOnWrite && !this.options.offlineMode) {
				try {
					await this.remoteDataSource.delete(id);
				} catch (remoteError) {
					console.warn("Failed to sync delete to remote:", remoteError);
					// 继续使用本地数据
				}
			}
		} catch (error) {
			console.error("Failed to delete data:", error);
			throw error;
		}
	}

	// 后台同步
	private async syncInBackground(): Promise<void> {
		if (this.syncInProgress || this.options.offlineMode) {
			return;
		}

		this.syncInProgress = true;

		try {
			const remoteData = await this.remoteDataSource.getAll();
			await this.saveAllToLocal(remoteData);
		} catch (error) {
			console.warn("Background sync failed:", error);
		} finally {
			this.syncInProgress = false;
		}
	}

	// 保存所有数据到本地
	private async saveAllToLocal(data: T[]): Promise<void> {
		try {
			// 清空本地数据
			const allLocalData = await this.localDataSource.getAll();
			for (const item of allLocalData) {
				await this.localDataSource.delete((item as any).id);
			}

			// 保存远程数据到本地
			for (const item of data) {
				await this.localDataSource.create(item);
			}
		} catch (error) {
			console.error("Failed to save remote data to local:", error);
		}
	}

	// 手动同步
	async sync(): Promise<void> {
		if (this.options.offlineMode) {
			return;
		}

		try {
			const remoteData = await this.remoteDataSource.getAll();
			await this.saveAllToLocal(remoteData);
		} catch (error) {
			console.error("Manual sync failed:", error);
			throw error;
		}
	}
}
