import { useState } from 'react';

import { useAppDispatch } from '../../app/store/configureStore';
import { removeAsset } from './reducers/walletSlice';

import { Button, Modal } from '../../common/components';


interface Props {
    isModalOpen: boolean;
    walletId: string;
    ticker: string;
    onModalClose: () => void;
}

const RemoveAssetModal = ({ isModalOpen, walletId, ticker, onModalClose }: Props) => {
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            await dispatch(removeAsset({ walletId, ticker })).unwrap();
            onModalClose();
        }
        catch (error: unknown) {
            if (typeof error === 'string') {
                setServerError(error);
            }
            else {
                setServerError('An unexpected error occurred while removing this asset.');
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen = {isModalOpen}
            title = 'Remove Asset'
            onClose = {onModalClose}
        >
            <p className = 'text-sm text-slate-600 mb-4'>
                Are you sure you want to permanently remove <span className = 'font-bold text-rose-600'>{ticker.toUpperCase()}</span> from this wallet? This action will remove the holding from your portfolio views.
            </p>

            {
                serverError &&
                (<div className = 'p-3 mb-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl'>
                    {serverError}
                </div>)
            }

            <div className = 'flex justify-end space-x-3 pt-3 border-t border-slate-100'>
                <Button
                    type = 'button'
                    onClick = {onModalClose}
                    disabled = {isSubmitting}
                    variant = 'secondary'
                >
                    Cancel
                </Button>

                <Button
                    type = 'button'
                    onClick = {handleDelete}
                    disabled = {isSubmitting}
                    variant = 'danger'
                    showSpinner
                >
                    { isSubmitting ? 'Removing...' : 'Confirm' }
                </Button>
            </div>
        </Modal>
    );
};


export default RemoveAssetModal;