export interface IApiError {
    message: string;
    code: number;
};

export interface IValidationError {
    field: string;
    message: string;
};