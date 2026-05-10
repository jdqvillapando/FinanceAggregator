import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
    }
});


export const { setWallets, setLoading } = walletSlice.actions;