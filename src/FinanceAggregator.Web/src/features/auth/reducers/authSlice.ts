import axios from 'axios';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import agent from '../../../app/api/agent';
import type { Result } from '../../../app/models/apiResponse';

import type { AuthResponse } from '../../../app/models/user';


interface AuthState {
    user: AuthResponse | null;
    status: 'idle' | 'pendingAsync' | 'failed';
    errorMessage: string | null;
}

const initialState: AuthState = {
    user: localStorage.getItem('jwt') ?
        {
            username: 'User',
            token: localStorage.getItem('jwt')!
        } as AuthResponse :
        null,
    status: 'idle',
    errorMessage: null
};

// The Login Thunk: Uses our authService domain
// export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
//     'account/loginUser', async (credentials: LoginCredentials, thunkAPI) => {
//         try {
//             const response = await agent.authService.login(credentials) as Result<AuthResponse>;
//             const { username, token } = response.data;
            
//             // Save the token on a successful explicit login
//             localStorage.setItem('jwt', token);
//             return { username, token };
//         }
//         catch (error: unknown) {
//             if (axios.isAxiosError(error)) {
//                 return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
//             }

//             return thunkAPI.rejectWithValue('An unexpected error occurred.');
//         }
//     }
// );

// The Hydration Thunk: Runs automatically on app startup if a token exists
export const fetchCurrentUser = createAsyncThunk<Omit<AuthResponse, 'token'>, void, { rejectValue: string[] }>(
    'account/fetchCurrentUser', async (_, thunkAPI) => {
        try {
            // Strictly type the network response to map to your Result wrapper
            const response = await agent.authService.getCurrentUser() as Result<AuthResponse>;
            
            // Checking your explicit boolean flag
            if (!response.isSuccess || !response.data) {
                return thunkAPI.rejectWithValue(response.errors || ['Failed to retrieve user session.']);
            }

            // Extract values directly from your 'data' property
            const { username, token } = response.data;
            
            // Rotate the session token safely
            localStorage.setItem('jwt', token);

            return { username };
        }
        catch (error: unknown) {
            // Always clear the token on session validation failure
            localStorage.removeItem('jwt');
            
            if (axios.isAxiosError(error)) {
                // Extract the backend errors array if available, fallback to a standard array
                const backendErrors = error.response?.data?.errors;
                return thunkAPI.rejectWithValue(
                    Array.isArray(backendErrors) ?
                        backendErrors :
                        [error.response?.data?.message || 'Session validation failed.']
                );
            }
            
            return thunkAPI.rejectWithValue(['An unexpected error occurred.']);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthUser: (state, action: PayloadAction<AuthResponse>) => {
            state.user = action.payload;
            // Persistence happens here, once, globally.
            localStorage.setItem('jwt', action.payload.token);
        },
        clearAuthErrors: (state) => {
            state.errorMessage = null;
        },
        signOut: (state) => {
            state.user = null;
            state.errorMessage = null;
            localStorage.removeItem('jwt');
            // We are clearing sessions as well.
            sessionStorage.clear();
        }
    },
    extraReducers: (builder) => {
        // Explicit Login Handlers
        // builder.addCase(loginUser.pending, (state) => {
        //     state.status = 'pendingAsync';
        //     state.errorMessage = null;
        // });

        // builder.addCase(loginUser.fulfilled, (state, action) => {
        //     state.status = 'idle';
        //     state.user = action.payload; // Instantly populates { username, token }
        //     state.errorMessage = null;
        // });

        // builder.addCase(loginUser.rejected, (state, action) => {
        //     state.status = 'failed';
        //     state.errorMessage = action.payload || 'Login failed';
        // });

        // Background Hydration Handlers
        builder.addCase(fetchCurrentUser.pending, (state) => {
            state.status = 'pendingAsync';
        });

        builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.status = 'idle';
            state.user = {
                username: action.payload.username,
                token: localStorage.getItem('jwt') || ''
            };
            state.errorMessage = null;
        });

        builder.addCase(fetchCurrentUser.rejected, (state, action) => {
            state.status = 'failed';
            state.user = null;
            state.errorMessage = Array.isArray(action.payload) ? action.payload[0] : 'Session expired';
        });
    },
});


export const { setAuthUser, signOut } = authSlice.actions;