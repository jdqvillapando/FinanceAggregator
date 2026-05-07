import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import agent from '../../app/api/agent';
import type { UserFormValues } from '../../app/models/user';
import type { Result } from '../../app/models/apiResponse';


interface Props {
    onRegisterSuccess: () => void;
}

const Register = ({ onRegisterSuccess }: Props) => {
    const [status, setStatus] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<UserFormValues>();

    const onSubmit = async (data: UserFormValues) => {
        setStatus('Communicating with Gateway...');
        
        try {
            const response = await agent.authService.register(data);
            setStatus(`Success! ${response.data}. Username: ${data.username}.`);

            // OPTIONAL: Add a small delay so the user can actually see
            // the success message before the screen flips back to Login.
            setTimeout(() => { onRegisterSuccess(); }, 2000);
        }
        catch (error: unknown) {
            // Check if it's an Axios Error
            if (axios.isAxiosError(error)) {
                // We tell Axios that the error response body matches our Result model
                const result = error.response?.data as Result<string>;
                setStatus(result?.message || 'Registration failed');
            }
            else {
                // Fallback for non-network errors (like a code crash)
                setStatus('An unexpected error occured');
                console.error(error);
            }
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Account</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div>
                    <input 
                        { ...register('fullName', { required: 'Full Name is required' }) }
                        placeholder="Full Name" 
                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    { errors.fullName && <span className="text-xs text-rose-500 mt-1">{errors.fullName.message}</span> }
                </div>

                <div>
                    <input 
                        { ...register('username', { required: 'Username is required' }) }
                        placeholder="Username" 
                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    { errors.username && <span className="text-xs text-rose-500 mt-1">{errors.username.message}</span> }
                </div>

                <div>
                    <input 
                        { ...register('email', { 
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                        }) }
                        type="email"
                        placeholder="Email" 
                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    { errors.email && <span className="text-xs text-rose-500 mt-1">{errors.email.message}</span> }
                </div>

                <div>
                    <input 
                        { ...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } }) }
                        type="password"
                        placeholder="Password" 
                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    { errors.password && <span className="text-xs text-rose-500 mt-1">{errors.password.message}</span> }
                </div>

                <button 
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-md active:scale-95"
                >
                    { isSubmitting ? 'Communicating with Gateway...' : 'Register' }
                </button>
            </form>

            {
                status && 
                (<div className={`mt-6 p-3 rounded-lg text-center text-sm font-semibold ${ status.includes('Success') ? 'bg-emerald-50 text-emerald-700' : (status.includes('Communicating') ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700') }`}>
                    { status }
                </div>)
            }
        </div>
    );
};


export default Register;