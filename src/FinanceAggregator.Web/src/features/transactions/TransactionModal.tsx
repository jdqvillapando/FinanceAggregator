import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAppDispatch } from '../../app/store/configureStore';
import { postNewTransaction } from '../../features/transactions/reducers/transactionSlice';

import { TransactionType, type TransactionFormValues } from '../../app/models/transaction';
import FormModal from '../../common/components/form';


interface Props {
    isModalOpen: boolean;
    walletId: string;
    assetId: string;
    ticker: string;
    type: TransactionType;
    onModalClose: () => void;
}

const TransactionModal = ({ isModalOpen, walletId, assetId, ticker, type, onModalClose }: Props) => {
    const dispatch = useAppDispatch();
    const [serverError, setServerError] = useState<string | null>(null);
    const isDeposit = type === TransactionType.Deposit;

    const formMethods = useForm<TransactionFormValues>({
        mode: 'onTouched', // Triggers validation on blur
        defaultValues: {
            amount: undefined,
            type: type,
            description: ''
        }
    });

    const onSubmit = async (values: TransactionFormValues) => {
        setServerError(null);

        try {
            const submissionPayload = {
                walletId,
                assetId,
                ticker,
                formValues: {
                    amount: Number(values.amount),
                    type: type,
                    description: values.description || (isDeposit ? 'Deposit' : 'Withdrawal')
                } as TransactionFormValues
            };

            await dispatch(postNewTransaction(submissionPayload)).unwrap();
            onModalClose(); 
        }
        catch (error: unknown) {
            if (typeof error === 'string') {
                setServerError(error);
            }
            else {
                setServerError('An unexpected failure occurred while doing transaction.');
            }
        }
    };

    return (
        <FormModal<TransactionFormValues>
            isOpen = {isModalOpen}
            methods = {formMethods}
            serverErrorsMsg = {serverError}
            submitLabel = 'Confirm'
            title = {isDeposit ? 'Deposit Funds' : 'Withdraw Funds'}
            onClose = {onModalClose}
            onSubmit = {onSubmit}
        >
            <div>
                <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1'>
                    Transaction Amount
                </label>
                <input 
                    type='number'
                    step='any'
                    placeholder='0.00'
                    className={`w-full text-sm p-3 bg-slate-50 border rounded-xl outline-none transition-colors font-medium text-slate-800 ${
                        formMethods.formState.errors.amount ?
                        'border-rose-400 focus:border-rose-500' :
                        'border-slate-200 focus:border-indigo-500'
                    }`}

                    {
                        ...formMethods.register('amount', {
                            required: 'Amount is explicitly required.',
                            min: {
                                value: 0.01,
                                message: 'Amount must be greater than zero.'
                            }
                        })
                    }
                />

                {
                    formMethods.formState.errors.amount && (
                    <span className='text-rose-500 text-xs font-semibold mt-1 block'>
                        {formMethods.formState.errors.amount.message}
                    </span>)
                }
            </div>

            <div>
                <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1'>
                    Memo / Description (Optional)
                </label>
                <input 
                    type='text'
                    placeholder={isDeposit ? 'e.g., Funds deposit allocation' : 'e.g., Portfolio rebalancing transfer'}
                    className={`w-full text-sm p-3 bg-slate-50 border rounded-xl outline-none transition-colors font-medium text-slate-800 ${
                        formMethods.formState.errors.description ?
                        'border-rose-400 focus:border-rose-500' :
                        'border-slate-200 focus:border-indigo-500'
                    }`}

                    {
                        ...formMethods.register('description', {
                            maxLength: {
                                value: 250,
                                message: 'Description cannot exceed 250 characters.'
                            }
                        })
                    }
                />

                { 
                    formMethods.formState.errors.description && (
                    <span className='text-rose-500 text-xs font-semibold mt-1 block'>
                        {formMethods.formState.errors.description.message}
                    </span>)
                }
            </div>
        </FormModal>
    );
};


export default TransactionModal;