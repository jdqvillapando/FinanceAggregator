import axios, { type AxiosResponse } from 'axios';
import type { Result } from '../models/apiResponse';
import type { AuthResponse, LoginCredentials, UserFormValues } from '../models/user';
import type { AddAssetValues, Asset, Wallet } from '../models/wallet';
import type { Transaction, TransactionFormValues, TransactionResponse } from '../models/transaction';
import { GATEWAY_URL } from '../../common/utils/constants';


// Use an instance instead of global defaults
const api = axios.create({
    baseURL: `${GATEWAY_URL}/api/v1`
});

// STANDARDS: Request Interceptor to automatically attach JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Cold-start retry interceptor
api.interceptors.response.use((response) => response, async (error) => {
    const { config, response } = error;

    // Retry once if gateway or downstream app is mid-boot (502/503 or network timeout)
    if ((!response || response.status === 502 || response.status === 503) && !config._retry) {
        config._retry = true;

        // Wait 3 seconds for container boot up and retry
        await new Promise((resolve) => setTimeout(resolve, 3000));

        return api(config);
    }

    return Promise.reject(error);
});

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// Non-blocking background ping to wake up YARP Gateway on site access
const warmUpServices = async () => {
    try {
    await fetch(`${GATEWAY_URL}/health`, { method: 'GET' });
    }
    // eslint-disable-next-line no-empty
    catch { } // Silently swallow errors during initial cold-startup
};

const authService = {
    register: (values: UserFormValues) => api.post<Result<string>>('/auth/register', values).then(responseBody),
    login: (values: LoginCredentials) => api.post<Result<AuthResponse>>('/auth/login', values).then(responseBody),
    getCurrentUser: () => api.get<Result<AuthResponse>>('/auth/currentUser').then(responseBody),
};

const walletService = {
    getWallets: () => api.get<Result<Wallet[]>>('/wallets').then(responseBody),
    addAssetToWallet: (walletId: string, body: AddAssetValues) => api.post<Result<Asset>>(`/wallets/${walletId}/assets`, body, { headers: { 'Content-Type': 'application/json' } }).then(responseBody),
    removeAssetFromWallet: (walletId: string, ticker: string) => api.delete<Result<string>>(`/wallets/${walletId}/assets/${ticker}`).then(responseBody),
};

const transactionService = {
    // GET History
    getTransactionHistory: (walletId: string, ticker: string) => 
        api.get<Result<Transaction[]>>(`/wallets/${walletId}/assets/${ticker}/transactions`, { headers: { 'Content-Type': 'application/json' } }).then(responseBody),

    // Make a transaction (Deposit or Withdraw)
    createTransaction: (walletId: string, ticker: string, body: TransactionFormValues) =>
        api.post<Result<TransactionResponse>>(`wallets/${walletId}/assets/${ticker}/transactions`, body, { headers: { 'Content-Type': 'application/json' } }).then(responseBody),
};

const agent = { authService, walletService, transactionService, warmUpServices };


export default agent;