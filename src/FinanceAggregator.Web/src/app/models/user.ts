export interface AuthResponse {
    username: string;
}

export interface LoginCredentials extends AuthResponse {
    password: string;
}

export interface UserFormValues extends LoginCredentials {
    email: string;
    fullName: string;
}