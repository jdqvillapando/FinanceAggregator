import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAppDispatch } from '../../app/store/configureStore';
import { postNewTransaction } from '../../features/transactions/reducers/transactionSlice';

import { TransactionType, type TransactionFormValues } from '../../app/models/transaction';


interface Props {
    walletId: string;
    assetId: string;
    ticker: string;
    type: TransactionType;
    onClose: () => void;
}

const TransactionModal = ({ walletId, assetId, ticker, type, onClose }: Props) => {
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<TransactionFormValues>({
        defaultValues: {
            amount: undefined,
            // Pre-populate the transaction type based on component props
            type: type,
            description: ''
        }
    });

    const [serverError, setServerError] = useState<string | null>(null);

    const isDeposit = type === TransactionType.Deposit;

    const onSubmit = async (values: TransactionFormValues) => {
        setServerError(null);

        // Package both the route context params and the form values object cleanly
        const resultAction = await dispatch(
            postNewTransaction({
                walletId,
                assetId,
                ticker,
                formValues: {
                    amount: Number(values.amount),
                    // Preserves the designated enum number context path
                    type: type,
                    description: values.description || (isDeposit ? 'Deposit' : 'Withdrawal')
                }
            })
        );

        if (postNewTransaction.fulfilled.match(resultAction)) {
            // Operation succeeded, slice context updated automatically, close the window element
            onClose(); 
        }
        else {
            // Set the error payload message sent back from our C# TransactionManager business rules
            setServerError(resultAction.payload as string || 'An unexpected error occurred.');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-100 transform scale-100 transition-all duration-300">
                
                <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                        { isDeposit ? 'Deposit Funds' : 'Withdraw Funds' }
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Asset Bucket: <span className="font-bold text-indigo-600">{ticker.toUpperCase()}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Amount Field Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Transaction Amount
                        </label>
                        <input 
                            type="number"
                            step="any"
                            placeholder="0.00"
                            {...register('amount', { 
                                required: 'Amount is explicitly required.',
                                min: { value: 0.01, message: 'Amount must be greater than zero.' }
                            })}
                            className="w-full text-2xl font-black text-slate-800 placeholder-slate-200 border-b-2 border-slate-100 focus:outline-none focus:border-indigo-500 transition-colors pb-2"
                        />
                        { errors.amount && (
                            <p className="text-rose-500 text-xs mt-2 font-medium">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Description Field Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Memo / Description (Optional)
                        </label>
                        <input 
                            type="text"
                            placeholder={isDeposit ? 'e.g., Funds deposit allocation' : 'e.g., Portfolio rebalancing transfer'}
                            {...register('description', {
                                maxLength: { value: 250, message: 'Description cannot exceed 250 characters.' }
                            })}
                            className="w-full text-sm font-medium text-slate-700 placeholder-slate-300 border-b border-slate-100 focus:outline-none focus:border-indigo-500 transition-colors pb-2"
                        />
                        { errors.description && (
                            <p className="text-rose-500 text-xs mt-2 font-medium">{errors.description.message}</p>
                        )}
                        { serverError && (
                            <p className="text-rose-500 text-xs mt-3 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">{serverError}</p>
                        )}
                    </div>

                    {/* Dialog Actions Controls */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={
                                `flex-1 py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 
                                ${ isDeposit ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100' }`
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