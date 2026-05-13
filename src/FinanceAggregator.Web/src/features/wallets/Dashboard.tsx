import { useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch } from '../../app/store/configureStore';
import { setWallets, setLoading } from './reducers/walletSlice';

import agent from '../../app/api/agent';
import { formatAssetDisplay } from '../../common/utils/currencyFormatters';

import { TransactionType } from '../../app/models/transaction';
import TransactionModal from '../transactions/TransactionModal';
import TransactionHistoryList from '../transactions/TransactionHistoryList';


const Dashboard = () => {
    const dispatch = useAppDispatch();
    const { wallets, loading } = useAppSelector(state => state.wallets);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<{walletId: string, assetId: string, ticker: string} | null>(null);
    const [modalType, setModalType] = useState<TransactionType>(TransactionType.Deposit);

    const openModal = (walletId: string, assetId: string, ticker: string, type: TransactionType) => {
        setSelectedAsset({ walletId, assetId, ticker });
        setModalType(type);
        setIsModalOpen(true);
    };

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
                                            <div key={asset.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{asset.ticker}</h4>
                                                        <p className="text-2xl font-black text-slate-700">{formatAssetDisplay(asset.ticker, asset.balance)}</p>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => openModal(wallet.id, asset.id, asset.ticker, TransactionType.Deposit)}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                                                            title="Deposit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => openModal(wallet.id, asset.id, asset.ticker, TransactionType.Withdrawal)}
                                                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors"
                                                            title="Withdraw"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <TransactionHistoryList walletId={wallet.id} assetId={asset.id} ticker={asset.ticker} />
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
            {
                isModalOpen && selectedAsset && (
                    <TransactionModal 
                        walletId={selectedAsset.walletId}
                        assetId={selectedAsset.assetId}
                        ticker={selectedAsset.ticker}
                        type={modalType}
                        onClose={() => setIsModalOpen(false)}
                    />
                )
            }
        </div>
    );
};


export default Dashboard;