import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useAppDispatch } from '../../app/store/configureStore';
import { addNewAsset } from './reducers/walletSlice';
import { type AddAssetValues } from '../../app/models/wallet';


interface Props {
    walletId: string;
    onClose: () => void;
}

const AddAssetModal = ({ walletId, onClose }: Props) => {
    const dispatch = useAppDispatch();
    const [serverError, setServerError] = useState<string | null>(null);

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<AddAssetValues>({
        defaultValues: {
            ticker: '',
            initialBalance: 0
        }
    });

    const onSubmit = async (data: AddAssetValues) => {
        setServerError(null);

        try {
            const submissionPayload = {
                walletId,
                values: {
                    ticker: data.ticker.toUpperCase().trim(),
                    initialBalance: Number(data.initialBalance)
                } as AddAssetValues
            };

            await dispatch(addNewAsset(submissionPayload)).unwrap();
            onClose(); 
        }
        catch (error: unknown) {
            if (typeof error === 'string') {
                setServerError(error);
            } else {
                setServerError('An unexpected failure occurred while allocating asset holdings.');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Allocate New Asset</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X />
                    </button>
                </div>

                {serverError && (
                    <div className="p-3 mb-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Asset Ticker Symbol
                        </label>
                        <input 
                            type="text"
                            placeholder="e.g., BTC, ETH, USD"
                            className={`w-full text-sm p-3 bg-slate-50 border rounded-xl outline-none transition-colors font-medium text-slate-800 ${
                                errors.ticker ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                            }`}
                            {...register('ticker', { 
                                required: 'Ticker symbol is required.',
                                maxLength: { value: 10, message: 'Ticker cannot exceed 10 characters.' }
                            })}
                        />
                        {errors.ticker && (
                            <span className="text-rose-500 text-xs font-semibold mt-1 block">
                                {errors.ticker.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Initial Position Balance
                        </label>
                        <input 
                            type="number"
                            step="any"
                            placeholder="0.00"
                            className={`w-full text-sm p-3 bg-slate-50 border rounded-xl outline-none transition-colors font-medium text-slate-800 ${
                                errors.initialBalance ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                            }`}
                            {...register('initialBalance', { 
                                required: 'Initial balance position is required.',
                                validate: value => value >= 0 || 'Balance position values cannot be negative.'
                            })}
                        />
                        {errors.initialBalance && (
                            <span className="text-rose-500 text-xs font-semibold mt-1 block">
                                {errors.initialBalance.message}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button 
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-sm shadow-indigo-100 transition-colors flex items-center justify-center"
                        >
                            {isSubmitting ? 'Allocating...' : 'Confirm Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default AddAssetModal;