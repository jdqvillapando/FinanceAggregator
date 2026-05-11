import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';

import { signOut } from '../../features/auth/reducers/authSlice';


const Navbar = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);

    return (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 mb-4" >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl">
                        F
                    </div>
                    <span className="font-bold text-slate-800 tracking-tight">FinanceAggregator</span>
                </div>

                <div className="flex items-center gap-6">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">v1.0 Microservices</span>
                    {
                        user ?
                        (
                            <>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Active User</span>
                                    <span className="text-sm font-medium text-slate-700">{user.username}</span>
                                </div>
                                <button 
                                    onClick={() => dispatch(signOut())}
                                    className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) :
                        (
                            <span className="text-sm text-slate-400 font-medium">Please sign in</span>
                        )
                    }
                </div>
            </div>
        </nav>
    );
};


export default Navbar;