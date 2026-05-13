import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/store/configureStore';
import { setTransactions, setLoading } from './reducers/transactionSlice';

import agent from '../../app/api/agent';
import { formatAssetDisplay } from '../../common/utils/currencyFormatters';


interface Props {
    walletId: string;
    assetId: string;
    ticker: string;
};

const TransactionHistoryList = ({ walletId, assetId, ticker }: Props) => {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector(state => state.transactions);
    // Select ONLY the transactions for this specific assetId
    const transactions = useAppSelector(state => state.transactions.transactionsByAsset[assetId] || []);

    useEffect(() => {
        if (!walletId || !ticker || !assetId) return;

        dispatch(setLoading(true));
        agent.transactionService
            .getTransactionHistory(walletId, ticker)
            .then(response => {
                if (response.isSuccess) {
                    dispatch(setTransactions({ assetId, transactions: response.data }));
                }
            })
            .finally(() => dispatch(setLoading(false)));
    }, [walletId, assetId, ticker, dispatch]);

    if (loading) return <p className="text-slate-500 animate-pulse">Loading ledger...</p>;

    return (
        <div className="mt-4 space-y-2">
            {
                transactions.length > 0 ? transactions.map(tr => (
                    <div key={tr.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <p className="text-sm font-bold text-slate-700">{tr.description}</p>
                            <p className="text-[10px] text-slate-400">{new Date(tr.timestamp).toLocaleString()}</p>
                        </div>
                        <div className={`font-black text-sm ${tr.amount > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {/* We use the ticker passed as a prop since it's an asset-specific history */}
                            {formatAssetDisplay(ticker, tr.amount)}
                        </div>
                    </div>
                )) :
                (
                    <p className="text-xs text-slate-400 italic">No transactions found for this asset.</p>
                )
            }
        </div>
    );
};


export default TransactionHistoryList;