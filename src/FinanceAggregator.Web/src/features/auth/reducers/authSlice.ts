import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthResponse } from '../../../app/models/user';


interface AuthState {
    user: AuthResponse | null;
}

const initialState: AuthState = {
    user: localStorage.getItem('jwt') ?
        {
            username: 'User',
            token: localStorage.getItem('jwt')!
        } as AuthResponse :
        null
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthUser: (state, action: PayloadAction<AuthResponse>) => {
            state.user = action.payload;
            // Persistence happens here, once, globally.
            localStorage.setItem('jwt', action.payload.token);
        },
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('jwt');
        }
    }
});


export const { setAuthUser, signOut } = authSlice.actions;