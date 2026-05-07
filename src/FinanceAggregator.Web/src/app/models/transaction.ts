import type { Asset } from "./wallet";


export const TransactionType = {
    Deposit: 0,
    Withdrawal: 1,
    Transfer: 2
} as const;

// Create a type based on those values. This allows you to use 'TransactionType' as a type for your interface.
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface Transaction {
    id: string;
    assetId: string;
    amount: number;
    type: TransactionType;
    timestamp: string;
    description: string;
    asset?: Asset | null; 
}

export interface TransactionFormValues {
    amount: number;
    type: TransactionType;
    description: string;
}

export interface TransactionResponse {
    ticker: string;
    newBalance: number;
    transactionId: string;
    timestamp: string;
}
