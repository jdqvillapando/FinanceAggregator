import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { useAppSelector, useAppDispatch } from '../store/configureStore';
import { fetchCurrentUser, signOut } from '../../features/auth/reducers/authSlice';

import { useWalletHub } from '../../common/hooks/useWalletHub';
import { Button, Navbar } from '../../common/components';
import { MAINTENANCE_MODE_ENABLED } from '../../common/utils/constants';

import agent from '../api/agent';

import Login from '../../features/auth/Login';
import Register from '../../features/auth/Register';

import  Maintenance  from './Maintenance';


const App = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const location = useLocation();

  const [isLoginView, setIsLoginView] = useState(true);

  useEffect(() => {
    if (!MAINTENANCE_MODE_ENABLED) {
      agent.warmUpServices();
    }
  }, []);

  useWalletHub();

  useEffect(() => {
    if (MAINTENANCE_MODE_ENABLED) {
      // Force-sign out when in maintenance mode
      dispatch(signOut());
    }
    else {
      // Quietly dispatch background hydration thunk on app mount (HttpOnly cookie attached automatically)
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  const isPublicRoute = location.pathname === '/about';

  return (
    <>
      <div className = 'min-h-screen bg-slate-50'>
        <Navbar />
        { MAINTENANCE_MODE_ENABLED && <Maintenance.Banner /> }
        <main className = 'container mx-auto px-4'>
          {
            (MAINTENANCE_MODE_ENABLED && !isPublicRoute) ?
            <div className = 'w-full flex justify-center'>
              <Maintenance.Notice />
            </div> :
            (
              (user || isPublicRoute) ?
              <Outlet /> :
              <>
                <div className = 'max-w-md mx-auto px-6'>
                  { isLoginView ? <Login /> : <Register onRegisterSuccess={ () => setIsLoginView(true) } /> }
                  <div className = 'w-full flex justify-center items-center gap-1.5 whitespace-nowrap mt-3'>
                    { isLoginView && <span className = 'text-sm text-slate-500'>No account yet?</span> }
                    <Button
                      className = 'text-sm text-slate-500 hover:text-indigo-600 transition-colors'
                      onClick={ () => setIsLoginView(!isLoginView) }
                      overrideBaseStyling
                    >
                      { isLoginView ? 'Register here' : 'Back to Login' }
                    </Button>
                  </div>
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
