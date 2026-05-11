import { useEffect } from 'react';

import { useAppSelector, useAppDispatch } from '../../app/store/configureStore';
import { setWallets, setLoading } from './reducers/walletSlice';

import agent from '../../app/api/agent';
import { formatAssetDisplay } from '../../common/utils/currencyFormatters';


const Dashboard = () => {
    const dispatch = useAppDispatch();
    const { wallets, loading } = useAppSelector(state => state.wallets);

    useEffect(() => {
        dispatch(setLoading(true));
        agent.walletService
            .getWallets()
            .then(response => {
                if (response.isSuccess) dispatch(setWallets(response.data));
            })
            .finally(() => dispatch(setLoading(false)));
    }, [dispatch]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-3xl font-black text-slate-800 mb-10 tracking-tight">Assets Overview</h2>
            
            <div className="space-y-8">
                {
                    wallets.length > 0 ?
                    (
                        wallets.map(wallet => (
                            <div key={wallet.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-8 py-3 border-b border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Wallet ID: {wallet.id.substring(0, 12)}...
                                    </span>
                                </div>

                                <div className={`p-8 grid grid-cols-1 ${ wallet.assets.length > 0 ? 'md:grid-cols-2 lg:grid-cols-3 gap-6' : '' }`}>
                                {
                                    wallet.assets.length > 0 ?
                                    (
                                        wallet.assets.map(asset => (
                                            <div key={asset.id} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-indigo-500 transition-all group">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black">
                                                        {asset.ticker}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        Confirmed Balance
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-800">
                                                    { formatAssetDisplay(asset.ticker, asset.balance) }
                                                </div>
                                            </div>
                                        ))
                                    ) :
                                    (
                                        /* This is the new "Empty Wallet" state */
                                        <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <div className="text-3xl mb-2">📭</div>
                                            <p className="text-sm text-slate-500 font-medium">This wallet is empty.</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">Deposit assets to see them here</p>
                                        </div>
                                    )
                                        
                                }
                                </div>
                            </div>
                        ))
                    ) :
                    (
                        /* This only shows if the USER has zero wallets at all */
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">No active wallets found for this account.</p>
                        </div>
                    )
                    
                }
            </div>
        </div>
    );
};


export default Dashboard;