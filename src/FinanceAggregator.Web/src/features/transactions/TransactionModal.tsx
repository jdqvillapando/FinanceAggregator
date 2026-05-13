import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAppDispatch } from '../../app/store/configureStore';
import { addTransaction } from '../../features/transactions/reducers/transactionSlice';

import agent from '../../app/api/agent';
import type { Result } from '../../app/models/apiResponse';
import {
    TransactionType,
    type Transaction,
    type TransactionFormValues,
    type TransactionResponse
} from '../../app/models/transaction';


interface Props {
    walletId: string;
    assetId: string;
    ticker: string;
    type: TransactionType;
    onClose: () => void;
}

const TransactionModal = ({ walletId, assetId, ticker, type, onClose }: Props) => {
    const dispatch = useAppDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm<TransactionFormValues>({
        defaultValues: { walletId: '', ticker: '', amount: undefined }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const isDeposit = type === TransactionType.Deposit;

    const onSubmit = async (values: TransactionFormValues) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            // Using the agent functions defined in agent.ts
            const response: Result<TransactionResponse> = isDeposit ?
                await agent.transactionService.deposit(walletId, ticker,values.amount) :
                await agent.transactionService.withdraw(walletId, ticker, values.amount);
            
            if (response.isSuccess) {
                const { transactionId, timestamp, ticker: responseTicker } = response.data;
                
                const addTransactionData: Transaction = {
                    id: transactionId,
                    assetId: assetId,
                    amount: isDeposit ? +values.amount : -values.amount, 
                    type: type,
                    timestamp: timestamp,
                    description: `${isDeposit ? 'Deposit' : 'Withdrawal'} of ${values.amount} ${responseTicker}`,
                    asset: null
                };

                dispatch(addTransaction(addTransactionData));
                onClose();
            }
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setServerError(error.response?.data?.message || "Transaction failed.");
            }
            else {
                setServerError("An unexpected error occurred.");
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className={ `p-6 text-white ${ isDeposit ? 'bg-emerald-600' : 'bg-rose-600' }` }>
                    <h3 className="text-xl font-bold">
                        { isDeposit ? 'Deposit' : 'Withdraw' } { ticker }
                    </h3>
                    <p className="text-white/80 text-sm">Enter the amount to process the transaction.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Amount ({ ticker })
                        </label>
                        <input 
                            autoFocus
                            type="number"
                            step="any"
                            placeholder="0.00"
                            // Using register instead of value/onChange
                            { ...register('amount', { required: 'Amount is required', min: 0.01, valueAsNumber: true }) }
                            // This trick selects the text when the user clicks/tabs into the field
                            onFocus={(e) => e.target.select()}
                            className="w-full text-3xl font-black text-slate-700 outline-none border-b-2 border-slate-100 focus:border-indigo-500 transition-colors pb-2"
                        />
                        { errors.amount && <p className="text-rose-500 text-xs mt-2 font-medium">{errors.amount.message || 'Invalid amount'}</p> }
                        { serverError && <p className="text-rose-500 text-xs mt-2 font-bold">{serverError}</p> }
                    </div>

                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={
                                `flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 
                                ${ isDeposit ? 'bg-emerald-600 shadow-emerald-200' : 'bg-rose-600 shadow-rose-200' }`
                            }
                        >
                            { isSubmitting ? 'Processing...' : 'Confirm' }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default TransactionModal;