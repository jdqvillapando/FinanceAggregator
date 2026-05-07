import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppDispatch } from '../../app/store/configureStore';
import { removeAsset } from './reducers/walletSlice';

interface Props {
    walletId: string;
    ticker: string;
    onClose: () => void;
}

const RemoveAssetModal = ({ walletId, ticker, onClose }: Props) => {
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            await dispatch(removeAsset({ walletId, ticker })).unwrap();
            onClose();
        }
        catch (err: unknown) {
            if (typeof err === 'string') {
                setServerError(err);
            } else {
                setServerError('An unexpected error occurred while pruning this asset.');
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-slate-800">Remove Asset</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X />
                    </button>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                    Are you sure you want to permanently remove <span className="font-bold text-rose-600">{ticker.toUpperCase()}</span> from this wallet? This action will remove the holding from your portfolio views.
                </p>

                {serverError && (
                    <div className="p-3 mb-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
                        {serverError}
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-xl shadow-sm shadow-rose-100 transition-colors"
                    >
                        {isSubmitting ? 'Removing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemoveAssetModal;