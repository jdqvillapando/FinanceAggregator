import { useState } from 'react';

import { useAppSelector } from '../store/configureStore';

import Navbar from '../../common/components/Navbar';
import Login from '../../features/auth/Login';
import Register from '../../features/auth/Register';
import Dashboard from '../../features/wallets/Dashboard';

import './App.css'


const App = () => {
  const { user } = useAppSelector(state => state.auth);

  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4">
          {
            user ? 
            <Dashboard /> :
            <>
              <div className="max-w-md mx-auto px-6">
                { isLoginView ? <Login /> : <Register onRegisterSuccess={() => setIsLoginView(true)} /> }
                <button
                  className="w-full mt-6 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsLoginView(!isLoginView)}
                >
                  { isLoginView ? "Register" : "Back to Login" }
                </button>
              </div>
            </>
          }
        </main>
      </div>
    </>
  );
};


export default App;
