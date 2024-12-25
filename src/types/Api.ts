export type ApiResponse<T> = {
    success: Boolean;
    data: T;
    error?: string;
};

export interface IApiClient {
    get<T>(uri: string): Promise<ApiResponse<T>>;
    post<T>(uri: string, data: object): Promise<ApiResponse<T>>;
    put<T>(uri: string, data: object): Promise<ApiResponse<T>>;
    delete<T>(uri: string): Promise<ApiResponse<T>>;
};