import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAppDispatch } from '../../app/store/configureStore';
import { setAuthUser } from './reducers/authSlice';

import agent from '../../app/api/agent';
import type { LoginCredentials } from '../../app/models/user';


const Login = () => {
    const dispatch = useAppDispatch();

    const [status, setStatus] = useState<string>('');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginCredentials>();

    const onSubmit = async (data: LoginCredentials) => {
        setStatus('Authenticating...');
        try {
            const response = await agent.authService.login(data);
            // On success, we'll get a User object with a Token
            setStatus(`Welcome back, ${response.data.username}!`);
            dispatch(setAuthUser(response.data));
        }
        catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setStatus(err.response?.data?.message || 'Login failed');
            }
            else {
                setStatus('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mt-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Login</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input 
                        {...register('username', { required: 'Username is required' })}
                        type="text"
                        placeholder="Enter your username" 
                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {errors.username && <span className="text-xs text-rose-500 mt-1">{errors.username.message}</span>}
                </div>

                <div>
                    <input 
                        {...register('password', { required: 'Password is required' })}
                        type="password"
                        placeholder="Password" 
                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.password && <span className="text-xs text-rose-500 mt-1">{errors.password.message}</span>}
                </div>

                <button 
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-md"
                >
                    {isSubmitting ? 'Verifying...' : 'Login'}
                </button>
            </form>

            {status && (
                <div className={`mt-6 p-3 rounded-lg text-center text-sm font-semibold ${status.includes('Welcome') ? 'bg-emerald-50 text-emerald-700' : (status.includes('Authenticating') ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700')}`}>
                    {status}
                </div>
            )}
        </div>
    );
};


export default Login;