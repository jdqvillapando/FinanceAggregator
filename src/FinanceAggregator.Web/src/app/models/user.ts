export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    username: string;
    token: string;
}

export interface UserFormValues extends LoginCredentials {
    email: string;
    fullName: string;
}