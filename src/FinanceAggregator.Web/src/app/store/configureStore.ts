import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { authSlice } from '../../features/auth/reducers/authSlice';
import { walletSlice } from '../../features/wallets/reducers/walletSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        wallets: walletSlice.reducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;