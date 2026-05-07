import axios from 'axios';
import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store/configureStore';
import { postNewTransaction } from '../../transactions/reducers/transactionSlice';

import type { AddAssetValues, Asset, Wallet } from '../../../app/models/wallet';

import agent from '../../../app/api/agent';


interface WalletState {
    wallets: Wallet[];
    loading: boolean;
}

const initialState: WalletState = {
    wallets: [],
    loading: false
};

export const addNewAsset = createAsyncThunk<
        Asset,
        { walletId: string; values: AddAssetValues; },
        { rejectValue: string; }>
    ('wallets/addNewAsset', async ({ walletId, values }, thunkAPI) => {
        try {
            const response = await agent.walletService.addAssetToWallet(walletId, values);

            if (!response.isSuccess || !response.data) {
                return thunkAPI.rejectWithValue(response.errors?.join(' ') || 'Failed to allocate asset.');
            }

            return response.data; // The returned Asset model
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Transaction processing encountered an error.');
            }

            return thunkAPI.rejectWithValue('An unexpected system exception occurred.');
        }
    });

export const removeAsset = createAsyncThunk<
        { walletId: string; ticker: string; },
        { walletId: string; ticker: string; },
        { rejectValue: string }>
    ('wallets/removeAsset', async ({ walletId, ticker }, thunkAPI) => {
        try {
            const response = await agent.walletService.removeAssetFromWallet(walletId, ticker);

            if (!response.isSuccess || !response.data) {
                return thunkAPI.rejectWithValue(response.errors?.join(' ') || 'Failed to remove asset');
            }

            return { walletId, ticker };
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Server error occurred during asset removal');
            }

            return thunkAPI.rejectWithValue('An unexpected system exception occurred.');
        }
    });

export const walletSlice = createSlice({
    name: 'wallets',
    initialState,
    reducers: {
        setWallets: (state, action: PayloadAction<Wallet[]>) => {
            state.wallets = action.payload;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        // Real-time web socket reaction reducer
        updateAssetBalance: (state, action: PayloadAction<{ assetId: string; newBalance: number; }>) => {
            const { assetId, newBalance } = action.payload;

            const wallet = state.wallets.find(w => w.assets.some(a => a.id === assetId));

            if (wallet) {
                const asset = wallet.assets.find(a => a.id === assetId);
                if (asset) {
                    // Instantly swap the old balance value out for the verified backend out-of-band figure
                    asset.balance = newBalance;
                }
            }
        },
    },
    extraReducers: (builder) => {
        // Listen for the successful completion of the unified backend transaction mutation thunk
        builder.addCase(postNewTransaction.fulfilled, (state, action) => {
            const { assetId, transaction } = action.payload;

            // Locate the wallet context that owns this asset bucket block
            const wallet = state.wallets.find(w => w.assets.some(a => a.id === assetId));

            if (wallet) {
                const asset = wallet.assets.find(a => a.id === assetId);

                if (asset) {
                    // Update the balance reactively based on the transaction ammount
                    asset.balance += transaction.amount;
                }
            }
        });

        // -=-=-=-=-=--=-=-=-=-=- ADD ASSET -=-=-=-=-=--=-=-=-=-=-
        builder.addCase(addNewAsset.pending, (state) => {
            state.loading = true;
        });

        builder.addCase(addNewAsset.fulfilled, (state, action) => {
            state.loading = false;
            
            const newAsset = action.payload;
            const wallet = state.wallets.find(w => w.id === newAsset.walletId);

            if (wallet) {
                if (!wallet.assets) wallet.assets = [];
                wallet.assets.push(newAsset); // Append the new holding reactively
            }
        });

        builder.addCase(addNewAsset.rejected, (state) => {
            state.loading = false;
        });
        // -=-=-=-=-=--=-=-=-=-=- END ADD ASSET -=-=-=-=-=--=-=-=-=-=-

        // -=-=-=-=-=--=-=-=-=-=- REMOVE ASSET -=-=-=-=-=-=-=--=-=-=-=-=-
        builder.addCase(removeAsset.pending, (state) => {
            state.loading = true;
        });

        builder.addCase(removeAsset.fulfilled, (state, action) => {
            state.loading = false;

            const { walletId, ticker } = action.payload;
            const wallet = state.wallets.find(w => w.id === walletId);

            if (wallet && wallet.assets) {
                // Remove asset reactively from Redux state array
                wallet.assets = wallet.assets.filter(a => a.ticker.toLowerCase() !== ticker.toLowerCase());
            }
        });

        builder.addCase(removeAsset.rejected, (state) => {
            state.loading = false;
        });
        // -=-=-=-=-=--=-=-=-=-=- END REMOVE ASSET -=-=-=-=-=--=-=-=-=-=-
    }
});

// Pure selector memoization boundary
const selectWalletState = (state: RootState) => state.wallets;

// --------------------------------------------------------------
// To ensure components only re-render if the internal balance values
// change, we modify the behavior of the selectors:
export const selectAllWallets = createSelector(
    [selectWalletState],
    (walletState) => walletState.wallets
);

export const selectWalletsLoading = createSelector(
    [selectWalletState],
    (walletState) => walletState.loading
);
// --------------------------------------------------------------

export const { setWallets, setLoading, updateAssetBalance } = walletSlice.actions;