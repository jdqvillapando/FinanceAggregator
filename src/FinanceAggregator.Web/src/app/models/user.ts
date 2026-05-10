export interface User {
    username: string;
    email: string;
    token: string;
}

export interface UserFormValues {
    username?: string;
    email: string;
    password: string;
    fullName: string;
}