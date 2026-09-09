import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAppDispatch } from '../../app/store/configureStore';
import { addNewAsset } from './reducers/walletSlice';

import { type AddAssetValues } from '../../app/models/wallet';
import FormModal  from '../../common/components/form/FormModal';


interface Props {
    isModalOpen: boolean;
    walletId: string;
    onModalClose: () => void;
}

const AddAssetModal = ({ isModalOpen, walletId, onModalClose }: Props) => {
    const dispatch = useAppDispatch();
    const [serverError, setServerError] = useState<string | null>(null);

    const formMethods = useForm<AddAssetValues>({
        mode: 'onTouched', // Triggers validation on blur
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
            onModalClose(); 
        }
        catch (error: unknown) {
            if (typeof error === 'string') {
                setServerError(error);
            }
            else {
                setServerError('An unexpected failure occurred while allocating asset holdings.');
            }
        }
    };

    return (
        <FormModal<AddAssetValues>
            isOpen = {isModalOpen}
            methods = {formMethods}
            serverErrorsMsg = {serverError}
            submitLabel = 'Confirm Asset'
            title = 'Allocate New Asset'
            onClose = {onModalClose}
            onSubmit = {onSubmit}
        >
            <div>
                <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1'>
                    Asset Ticker Symbol
                </label>
                <input 
                    type = 'text'
                    placeholder = 'e.g.: BTC, ETH, USD'
                    className = {`w-full text-sm p-3 bg-slate-50 border rounded-xl outline-none transition-colors font-medium text-slate-800 ${
                        formMethods.formState.errors.ticker ?
                        'border-rose-400 focus:border-rose-500' :
                        'border-slate-200 focus:border-indigo-500'
                    }`}

                    {
                        ...formMethods.register('ticker', {
                            required: 'Ticker symbol is required.',
                            maxLength: {
                                value: 10,
                                message: 'Ticker cannot exceed 10 characters.'
                            }
                        })
                    }
                />

                {
                    formMethods.formState.errors.ticker && (
                    <span className = 'text-rose-500 text-xs font-semibold mt-1 block'>
                        {formMethods.formState.errors.ticker.message}
                    </span>)
                }
            </div>

            <div>
                <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1'>
                    Initial Balance
                </label>
                <input 
                    type = 'number'
                    step = 'any'
                    placeholder = '0.00'
                    className = {`w-full text-sm p-3 bg-slate-50 border rounded-xl outline-none transition-colors font-medium text-slate-800 ${
                        formMethods.formState.errors.initialBalance ?
                        'border-rose-400 focus:border-rose-500' :
                        'border-slate-200 focus:border-indigo-500'
                    }`}

                    {
                        ...formMethods.register('initialBalance', {
                            required: 'Initial balance is required.',
                            validate: value => value > 0 || 'Balance values cannot be zero or below.'
                        })
                    }
                />

                {
                    formMethods.formState.errors.initialBalance && (
                    <span className='text-rose-500 text-xs font-semibold mt-1 block'>
                        {formMethods.formState.errors.initialBalance.message}
                    </span>)
                }
            </div>
        </FormModal>
    );
};


export default AddAssetModal;