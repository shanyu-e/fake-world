import { request } from "@/services";
import type { ApiResponse, IDataSource, PaginatedResponse } from "../types/IDataSource";
import { keysToCamelCase, keysToSnakeCase } from "@/utils/caseConverter";

function isPaginatedResponse<U>(value: unknown): value is PaginatedResponse<U> {
  return typeof value === "object" && value !== null && Array.isArray((value as { data?: unknown }).data) && "pagination" in (value as object);
}

export class RemoteDataSource<T> implements IDataSource<T> {
  constructor(private endpoint: string) {}

  async get(id: string): Promise<T> {
    try {
      const response = await request.get(`${this.endpoint}/${id}`);
      const apiResponse: ApiResponse<T> = response.data;

      if (apiResponse.code !== 0) {
        throw new Error(apiResponse.message);
      }

      // 将响应数据的键名从下划线转换为驼峰
      return keysToCamelCase<T>(apiResponse.data);
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const response = await request.get(this.endpoint);
      const apiResponse: ApiResponse<T[]> | PaginatedResponse<T[]> = response.data;

      if (apiResponse.code !== 0) {
        throw new Error(apiResponse.message);
      }

      const payload = apiResponse.data as T[] | PaginatedResponse<T>;
      const data = isPaginatedResponse<T>(payload) ? payload.data : (payload as T[]);

      // 将响应数据的键名从下划线转换为驼峰
      return keysToCamelCase<T[]>(data);
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, "id">): Promise<T> {
    try {
      // 将请求数据的键名从驼峰转换为下划线
      const snakeCaseData = keysToSnakeCase(data);
      const response = await request.post(this.endpoint, snakeCaseData);
      const apiResponse: ApiResponse<T> = response.data;

      if (apiResponse.code !== 0) {
        throw new Error(apiResponse.message);
      }

      // 将响应数据的键名从下划线转换为驼峰
      return keysToCamelCase<T>(apiResponse.data);
    } catch (error) {
      console.error(`Error creating in ${this.endpoint}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      // 将请求数据的键名从驼峰转换为下划线
      const snakeCaseData = keysToSnakeCase(data);
      const response = await request.put(`${this.endpoint}/${id}`, snakeCaseData);
      const apiResponse: ApiResponse<T> = response.data;

      if (apiResponse.code !== 0) {
        throw new Error(apiResponse.message);
      }

      // 将响应数据的键名从下划线转换为驼峰
      return keysToCamelCase<T>(apiResponse.data);
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
