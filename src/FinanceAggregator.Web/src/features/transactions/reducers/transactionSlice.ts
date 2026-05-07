import axios from 'axios';
import { createAsyncThunk, createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store/configureStore';
import type { Transaction, TransactionFormValues } from '../../../app/models/transaction';

import agent from '../../../app/api/agent';


interface TransactionState {
    transactionsByAsset: Record<string, Transaction[]>;
    loading: boolean;
}

const initialState: TransactionState = {
    transactionsByAsset: {},
    loading: false
};

export const postNewTransaction = createAsyncThunk<
        // Success return type (PayloadAction payload)
        { assetId: string; transaction: Transaction; },
        // Thunk Input arguments
        { walletId: string; assetId: string; ticker: string; formValues: TransactionFormValues; },
        // Typed rejection fallback value
        { rejectValue: string }>
    ('transactions/postNewTransaction', async ({ walletId, assetId, ticker, formValues }, thunkAPI) => {
        try {
            // Invoke the transaction API endpoint
            const response = await agent.transactionService.createTransaction(walletId, ticker, formValues);
            
            if (!response.isSuccess || !response.data) {
                return thunkAPI.rejectWithValue(response.message || 'Failed to record transaction.');
            }

            const responseData = response.data;

            // Map the API Response details back into your state-compatible transaction record structure
            const newTransaction: Transaction = {
                id: responseData.transactionId,
                assetId: assetId,
                // If formValues.type represents a Withdrawal (1), negate the visual numeric amount for ledger grids
                amount: formValues.type === 1 ? -formValues.amount : +formValues.amount,
                type: formValues.type,
                description: formValues.description,
                timestamp: responseData.timestamp
            };

            return { assetId, transaction: newTransaction };
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Transaction processing encountered an error.');
            }

            return thunkAPI.rejectWithValue('An unexpected system exception occurred.');
        }
    });

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
        clearTransactions: (state) => {
            state.transactionsByAsset = {};
        }
    }, extraReducers: (builder) => {
        builder.addCase(postNewTransaction.fulfilled, (state, action) => {
            const { assetId, transaction } = action.payload;

            // Strict boundary safety check: Initialize the array slice bucket if it is completely blank
            if (!state.transactionsByAsset[assetId]) {
                state.transactionsByAsset[assetId] = [];
            }
            
            // Insert the certified backend transaction directly at index 0 
            // This instantly updates your memoized view list components with zero lag!
            state.transactionsByAsset[assetId] = [transaction, ...state.transactionsByAsset[assetId]];
        });
    },
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


export const { setTransactions, setLoading, clearTransactions } = transactionSlice.actions;