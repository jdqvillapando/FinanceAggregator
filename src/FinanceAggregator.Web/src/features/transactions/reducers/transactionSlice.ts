import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Transaction } from '../../../app/models/transaction';


interface TransactionState {
    transactionsByAsset: Record<string, Transaction[]>;
    loading: boolean;
}

const initialState: TransactionState = {
    transactionsByAsset: {},
    loading: false
};

export const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        setTransactions: (state, action: PayloadAction<{assetId: string,transactions: Transaction[]}>) => {
            const { assetId, transactions } = action.payload;
            state.transactionsByAsset[assetId] = transactions;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        addTransaction: (state, action: PayloadAction<Transaction>) =>{
            const tr = action.payload;
            // If the bucket doesn't exist yet, create it
            if (!state.transactionsByAsset[tr.assetId]) {
                state.transactionsByAsset[tr.assetId] = [];
            }
            // Add the new transaction to the top of the correct bucket
            state.transactionsByAsset[tr.assetId] = [tr, ...state.transactionsByAsset[tr.assetId]];
        },
        clearTransactions: (state) => {
            state.transactionsByAsset = {};
        }
    }
});


export const { setTransactions, setLoading, addTransaction, clearTransactions } = transactionSlice.actions;