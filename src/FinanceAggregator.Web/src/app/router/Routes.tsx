import { createBrowserRouter, Navigate } from 'react-router';
import App from '../layout/App';
import About from '../layout/About';
import Dashboard from '../../features/wallets/Dashboard';
// import { EditProfile } from '../../features/account/EditProfile';


export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'about', element: <About /> },
            // { path: 'profile/edit', element: <EditProfile /> },

            /* Catch-all fallback: Redirects any unmapped route (e.g., /profile) to '/' */
            { path: '*', element: <Navigate replace to = '/' /> },
        ]
    }
]);