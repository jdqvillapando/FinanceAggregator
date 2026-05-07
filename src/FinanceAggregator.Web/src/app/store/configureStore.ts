import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { configureStore, combineReducers, type UnknownAction } from '@reduxjs/toolkit';

import { authSlice } from '../../features/auth/reducers/authSlice';
import { walletSlice } from '../../features/wallets/reducers/walletSlice';
import { transactionSlice } from '../../features/transactions/reducers/transactionSlice';

// Combine all individual slices into a single aggregate slice reducer map
const appReducer = combineReducers({
    auth: authSlice.reducer,
    wallets: walletSlice.reducer,
    transactions: transactionSlice.reducer,
});

// Implement the Global Interceptor Reducer Guard
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
    // When the user triggers sign out, intercept the action type and purge state from RAM
    if (action.type === 'auth/signOut') {
        // Forcing state to undefined forces Redux Toolkit to re-initialize 
        // every single slice back to its respective clean, initial empty states.
        state = undefined; 
    }
    return appReducer(state, action);
};

// Register the global rootReducer interceptor inside the core store
export const store = configureStore({
    reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;