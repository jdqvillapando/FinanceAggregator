import axios, { type AxiosResponse } from 'axios';
import type { Result } from '../models/apiResponse';
import type { User, UserFormValues } from '../models/user';
import type { Wallet } from '../models/wallet';


// Use an instance instead of global defaults
const api = axios.create({
    baseURL: 'http://localhost:5153/api/v1'
});

// STANDARDS: Request Interceptor to automatically attach JWT
api.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt');

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const authService = {
    register: (values: UserFormValues) => api.post<Result<string>>('/auth/register', values).then(responseBody),
    login: (values: UserFormValues) => api.post<Result<User>>('/auth/login', values).then(responseBody),
};

const walletService = {
    // This will hit http://localhost:5153/api/v1/wallets
    getWallets: () => api.get<Result<Wallet[]>>('/wallets').then(responseBody),
};

const agent = { authService, walletService };


export default agent;