export interface AuthResponse {
    username: string;
    token: string;
}

export interface UserFormValues {
    username?: string;
    email: string;
    password: string;
    fullName: string;
}