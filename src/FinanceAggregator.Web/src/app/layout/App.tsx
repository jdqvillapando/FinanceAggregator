import { useState } from 'react';

import { useAppSelector, useAppDispatch } from '../store/configureStore';
import { signOut } from '../../features/auth/reducers/authSlice';

import Login from '../../features/auth/Login';
import Register from '../../features/auth/Register';
import Dashboard from '../../features/wallets/Dashboard';

import './App.css'


const App = () => {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <nav className="p-6 bg-white shadow-sm mb-12">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black text-indigo-600 tracking-tighter">FINANCE.AGGREGATOR</h1>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">v1.0 Microservices</span>
            {
              user ?
              (
                <>
                  <span className="text-sm font-medium text-slate-600">Hi, {user.username}</span>
                  <button 
                    onClick={() => dispatch(signOut())}
                    className="text-xs bg-slate-200 hover:bg-rose-100 hover:text-rose-600 px-3 py-1 rounded transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) :
              (
                <button 
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="text-sm font-bold text-indigo-600 hover:underline"
                >
                  {isLoginView ? "Create Account" : "Login"}
                </button>
              )
            }
          </div>
        </nav>

        <main className="container mx-auto px-4">
          {
            user ? 
            <Dashboard /> : 
            (isLoginView ? <Login /> : <Register />)
          }
        </main>
      </div>
    </>
  );
};


export default App;
