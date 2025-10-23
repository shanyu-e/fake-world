import { request } from "@/services";
import type { ApiResponse, IDataSource } from "../types/IDataSource";

export class RemoteDataSource<T> implements IDataSource<T> {
	constructor(private endpoint: string) {}

	async get(id: string): Promise<T> {
		try {
			const response = await request.get(`${this.endpoint}/${id}`);
			const apiResponse: ApiResponse<T> = response.data;

			if (apiResponse.code !== 0) {
				throw new Error(apiResponse.message);
			}

			return apiResponse.data;
		} catch (error) {
			console.error(`Error fetching ${this.endpoint}/${id}:`, error);
			throw error;
		}
	}

	async getAll(): Promise<T[]> {
		try {
			const response = await request.get(this.endpoint);
			const apiResponse: ApiResponse<T[]> = response.data;

			if (apiResponse.code !== 0) {
				throw new Error(apiResponse.message);
			}

			return apiResponse.data;
		} catch (error) {
			console.error(`Error fetching ${this.endpoint}:`, error);
			throw error;
		}
	}

	async create(data: Omit<T, "id">): Promise<T> {
		try {
			const response = await request.post(this.endpoint, data);
			const apiResponse: ApiResponse<T> = response.data;

			if (apiResponse.code !== 0) {
				throw new Error(apiResponse.message);
			}

			return apiResponse.data;
		} catch (error) {
			console.error(`Error creating in ${this.endpoint}:`, error);
			throw error;
		}
	}

	async update(id: string, data: Partial<T>): Promise<T> {
		try {
			const response = await request.put(`${this.endpoint}/${id}`, data);
			const apiResponse: ApiResponse<T> = response.data;

			if (apiResponse.code !== 0) {
				throw new Error(apiResponse.message);
			}

			return apiResponse.data;
		} catch (error) {
			console.error(`Error updating ${this.endpoint}/${id}:`, error);
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		try {
			const response = await request.delete(`${this.endpoint}/${id}`);
			const apiResponse: ApiResponse<null> = response.data;

			if (apiResponse.code !== 0) {
				throw new Error(apiResponse.message);
			}
		} catch (error) {
			console.error(`Error deleting ${this.endpoint}/${id}:`, error);
			throw error;
		}
	}
}
