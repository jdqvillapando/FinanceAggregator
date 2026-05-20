import { useState, useEffect } from 'react';

import { useAppSelector, useAppDispatch } from '../../app/store/configureStore';
import { setWallets, setLoading, selectAllWallets, selectWalletsLoading } from './reducers/walletSlice';

import agent from '../../app/api/agent';
import { formatAssetDisplay } from '../../common/utils/currencyFormatters';

import { TransactionType } from '../../app/models/transaction';
import TransactionModal from '../transactions/TransactionModal';
import TransactionHistoryList from '../transactions/TransactionHistoryList';


const Dashboard = () => {
    const dispatch = useAppDispatch();
    // Optimized memoized selectors
    const wallets = useAppSelector(selectAllWallets);
    const loading = useAppSelector(selectWalletsLoading);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<{walletId: string, assetId: string, ticker: string} | null>(null);
    const [modalType, setModalType] = useState<TransactionType>(TransactionType.Deposit);
    const [focusedAsset, setFocusedAsset] = useState<{walletId: string, assetId: string, ticker: string} | null>(null); // Dual-Panel focus selection state

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
        <div className="space-y-6">
            {/* MASTER SYSTEM LAYOUT MATRIX DESEGREGATION GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* LEFT PORTION: MAIN ASSET LEDGER CARDS (Takes up 2/3 of space) */}
                <div className="lg:col-span-2 space-y-6">
                    {
                        wallets && wallets.length > 0 ? (
                            wallets.map((wallet) => (
                                <div key={wallet.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{wallet.name}</h2>
                                            <p className="text-[11px] font-mono text-slate-400">Wallet ID: {wallet.id.substring(0, 12)}...</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {
                                        wallet.assets && wallet.assets.length > 0 ? (
                                            wallet.assets.map((asset) => {
                                                const isCardFocused = focusedAsset?.assetId === asset.id;
                                                
                                                return (
                                                    <div 
                                                        key={asset.id} 
                                                        // CAPTURING INTERACTION LOCALLY INSTEAD OF FIRING ROUTER DISPATCHES
                                                        onClick={() => setFocusedAsset({ walletId: wallet.id, assetId: asset.id, ticker: asset.ticker })}
                                                        className={`p-5 rounded-xl border transition-all cursor-pointer group ${
                                                            isCardFocused ?
                                                                'bg-indigo-50/50 border-indigo-300 shadow-sm ring-1 ring-indigo-100' :
                                                                'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                                                            }`
                                                        }
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <span className="px-2.5 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-md uppercase tracking-wider">
                                                                    {asset.ticker}
                                                                </span>
                                                                <p className="text-[10px] font-mono text-slate-400 mt-2">Asset ID: {asset.id.substring(0, 12)}...</p>
                                                            </div>
                                                            <span className="text-lg font-bold font-mono text-slate-900">
                                                                { formatAssetDisplay(asset.ticker, asset.balance) }
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                                            <button 
                                                                onClick={() => openModal(wallet.id, asset.id, asset.ticker, TransactionType.Deposit)}
                                                                className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-xs font-semibold text-emerald-600 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors"
                                                            >
                                                                Deposit
                                                            </button>
                                                            <button 
                                                                onClick={() => openModal(wallet.id, asset.id, asset.ticker, TransactionType.Withdrawal)}
                                                                className="py-1.5 px-3 bg-white hover:bg-rose-50 text-xs font-semibold text-rose-600 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
                                                            >
                                                                Withdraw
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) :
                                        (
                                            /* This is the new "Empty Wallet" state */
                                            <div className="col-span-2 text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
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

                {/* RIGHT PORTION: SIDE-BY-SIDE INSIGHTS CONTAINER (Takes up 1/3 of space) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[400px] lg:sticky lg:top-6">
                    {
                        focusedAsset ?
                        (
                            /* INJECTING CONTEXT OVER PURE PROP CONTRACTS BOUNDARIES */
                            <TransactionHistoryList 
                                walletId={focusedAsset.walletId} 
                                assetId={focusedAsset.assetId} 
                                ticker={focusedAsset.ticker} 
                            />
                        ) :
                        (
                            /* COMPLEMENTARY PLACEHOLDER CALL TO ACTION CONTEXT */
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-60">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                                    <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Ledger Insights Panel</h3>
                                <p className="text-xs text-slate-400 max-w-[200px] mt-1 mx-auto">Select any active asset row card container to securely evaluate historical ledger logs in real-time.</p>
                            </div>
                        )
                    }
                </div>
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