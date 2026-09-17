import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAppDispatch } from '../../app/store/configureStore';
import { postNewTransaction } from '../../features/transactions/reducers/transactionSlice';

import { TransactionType, type TransactionFormValues } from '../../app/models/transaction';
import { FormInput, FormLabel, FormModal } from '../../common/components/forms';


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
            title = {isDeposit ? `Deposit Funds (${ticker})` : `Withdraw Funds (${ticker})`}
            submitButtonVariant = {isDeposit ? 'success' : 'danger'}
            onClose = {onModalClose}
            onSubmit = {onSubmit}
        >
            <div className = 'pb-2'>
                <FormLabel
                    htmlFor = 'amount'
                    helperText = 'Input amount must be a number greater than zero'
                    error = {formMethods.formState.errors.amount}
                    required
                >
                    Transaction Amount
                </FormLabel>
                <FormInput
                    name = 'amount'
                    type = 'number'
                    step = 'any'
                    placeholder = '0.00'
                    rules = {{
                        required: 'Amount is explicitly required.',
                        min: {
                            value: 0.01,
                            message: 'Amount must be greater than zero.'
                        }
                    }}
                    errorMessage = {formMethods.formState.errors.amount?.message}
                />
            </div>

            <div className='pt-2'>
                <FormLabel
                    htmlFor = 'description'
                    helperText = 'Optional; Limited to 250 characters'
                    error = {formMethods.formState.errors.description}
                >
                    Memo/Description
                </FormLabel>
                <FormInput
                    name = 'description'
                    type = 'text'
                    placeholder = {isDeposit ? 'e.g., Funds deposit allocation' : 'e.g., Portfolio rebalancing transfer'}
                    rules = {{
                        maxLength: {
                            value: 250,
                            message: 'Description cannot exceed 250 characters.'
                        }
                    }}
                    errorMessage = {formMethods.formState.errors.description?.message}
                />
            </div>
        </FormModal>
    );
};


export default TransactionModal;