import axios, { type AxiosResponse } from 'axios';
import type { Result } from '../models/apiResponse';
import type { AuthResponse, LoginCredentials, UserFormValues } from '../models/user';
import type { AddAssetValues, Asset, Wallet } from '../models/wallet';
import type { Transaction, TransactionFormValues, TransactionResponse } from '../models/transaction';
import { GATEWAY_URL } from '../../common/constants';


// Use an instance instead of global defaults
const api = axios.create({
    baseURL: `${GATEWAY_URL}/api/v1`
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
    getWallets: () => api.get<Result<Wallet[]>>('/wallets').then(responseBody),
    addAssetToWallet: (walletId: string, body: AddAssetValues) => api.post<Result<Asset>>(`/wallets/${walletId}/assets`, body, { headers: { 'Content-Type': 'application/json' } }).then(responseBody),
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