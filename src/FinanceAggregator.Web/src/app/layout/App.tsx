import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { useAppSelector, useAppDispatch } from '../store/configureStore';
import { fetchCurrentUser, signOut } from '../../features/auth/reducers/authSlice';

import { useWalletHub } from '../../common/hooks/useWalletHub';
import { Navbar } from '../../common/components';
import { MAINTENANCE_MODE_ENABLED } from '../../common/utils/constants';

import agent from '../api/agent';

import Login from '../../features/auth/Login';
import Register from '../../features/auth/Register';

import { MaintenanceModeMain } from './Maintenance';
import './App.css'


const App = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const location = useLocation();

  const [isLoginView, setIsLoginView] = useState(true);

  useEffect(() => { agent.warmUpServices(); }, []);

  useWalletHub();

  useEffect(() => {
    if (MAINTENANCE_MODE_ENABLED) {
      // Force-sign out when in maintenance mode
      dispatch(signOut());
    }
    else {
      // Grab the current stored token from the standardized storage key
      const token = localStorage.getItem('jwt');
      
      // If a token exists, quietly dispatch the background hydration thunk
      if (token) {
        dispatch(fetchCurrentUser());
      }
    }
  }, [dispatch]);

  const isPublicRoute = location.pathname === '/about';

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4">
          {
            MAINTENANCE_MODE_ENABLED ?
            <MaintenanceModeMain /> :
            (
              (user || isPublicRoute) ?
              <Outlet /> :
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
            )
          }
        </main>
      </div>
    </>
  );
};


export default App;
