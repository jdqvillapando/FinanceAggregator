import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type RootState } from '../../../app/store/configureStore';
import { postNewTransaction } from '../../transactions/reducers/transactionSlice';

import type { Wallet } from '../../../app/models/wallet';


interface WalletState {
    wallets: Wallet[];
    loading: boolean;
}

const initialState: WalletState = {
    wallets: [],
    loading: false
};

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