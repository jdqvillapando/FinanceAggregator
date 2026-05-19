import axios, { type AxiosResponse } from 'axios';
import type { Result } from '../models/apiResponse';
import type { AuthResponse, LoginCredentials, UserFormValues } from '../models/user';
import type { Wallet } from '../models/wallet';
import type { Transaction, TransactionFormValues, TransactionResponse } from '../models/transaction';


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
    login: (values: LoginCredentials) => api.post<Result<AuthResponse>>('/auth/login', values).then(responseBody),
    getCurrentUser: () => api.get<Result<AuthResponse>>('/auth/currentUser').then(responseBody),
};

const walletService = {
    // This will hit http://localhost:5153/api/v1/wallets
    getWallets: () => api.get<Result<Wallet[]>>('/wallets').then(responseBody),
};

const transactionService = {
    // GET History
    getTransactionHistory: (walletId: string, ticker: string) => 
        api.get<Result<Transaction[]>>(`/wallets/${walletId}/assets/${ticker}/transactions`, { headers: { 'Content-Type': 'application/json' } }).then(responseBody),

    // Make a transaction (Deposit or Withdraw)
    createTransaction: (walletId: string, ticker: string, body: TransactionFormValues) =>
        api.post<Result<TransactionResponse>>(`wallets/${walletId}/assets/${ticker}/transactions`, body, { headers: { 'Content-Type': 'application/json' } }).then(responseBody),
};

const agent = { authService, walletService, transactionService };


export default agent;