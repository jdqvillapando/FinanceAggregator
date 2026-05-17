import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store/configureStore';
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

// ----------------------------------------------------------------
// Fix for warning because of re-rendering TransactionHistoryList
// ----------------------------------------------------------------
// A simple lookup selector to grab the raw transactions map out of the store state
const selectTransactionsByAssetMap = (state: RootState) => state.transactions.transactionsByAsset;

// A factory or parameterized selector that returns a memoized array for a given assetId
export const selectTransactionsByAsset = createSelector(
    [
        selectTransactionsByAssetMap,
        // Pass a small inline selector to extract the input parameter argument safely
        (_state: RootState, assetId: string) => assetId
    ],
    (transactionsMap, assetId) => {
        // Redux Toolkit caches this array reference pointer. 
        // If the transactions mapping dictionary has not mutated, it skips recalculation.
        return transactionsMap[assetId] || []; 
    }
);


export const { setTransactions, setLoading, addTransaction, clearTransactions } = transactionSlice.actions;