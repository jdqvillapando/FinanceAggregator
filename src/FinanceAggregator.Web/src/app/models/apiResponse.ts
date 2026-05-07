export interface Result<T> {
    data: T;
    isSuccess: boolean;
    message: string;
    errors?: string[];
}