import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
        }
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


export const { setWallets, setLoading } = walletSlice.actions;