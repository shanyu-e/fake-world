// 数据源接口定义
export interface IDataSource<T> {
	get(id: string): Promise<T>;
	getAll(): Promise<T[]>;
	create(data: Omit<T, "id">): Promise<T>;
	update(id: string, data: Partial<T>): Promise<T>;
	delete(id: string): Promise<void>;
}

// 分页数据源接口
export interface IPaginatedDataSource<T> extends IDataSource<T> {
	getPaginated(
		page: number,
		limit: number,
		filters?: Record<string, any>,
	): Promise<{
		data: T[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}>;
}

// 统一API响应格式
export interface ApiResponse<T> {
	data: T;
	message: string;
	code: number;
	timestamp: number;
}

// 分页响应格式
export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
