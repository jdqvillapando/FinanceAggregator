import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useAppDispatch } from '../../app/store/configureStore';
import { addNewAsset } from './reducers/walletSlice';

import { type AddAssetValues } from '../../app/models/wallet';
import { FormDropdown, FormInput, FormLabel, FormModal }  from '../../common/components/forms';
import { type DropdownOption } from '../../common/components';

import { getLocaleOptions, isTickerAvailable } from '../../common/utils/localization';


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
            locale: null,
            initialBalance: 0
        }
    });

    const watchedTicker = useWatch({
        control: formMethods.control,
        name: 'ticker',
        defaultValue: ''
    });

    const normalizedTicker = watchedTicker?.toUpperCase().trim() || '';
    let localeOptions: DropdownOption[] = [];

    if (isTickerAvailable(normalizedTicker)) {
        localeOptions = getLocaleOptions(normalizedTicker);
    }

    const onSubmit = async (data: AddAssetValues) => {
        setServerError(null);

        try {
            const submissionPayload = {
                walletId,
                values: {
                    ticker: data.ticker.toUpperCase().trim(),
                    locale: localeOptions.length === 0 ?
                        null : (
                            localeOptions.length === 1 ?
                            localeOptions[0].value : 
                            (data.locale || null)),
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
            <div className = 'pb-2'>
                <FormLabel
                    htmlFor = 'ticker'
                    error = {formMethods.formState.errors.ticker}
                    required
                >
                    Asset Ticker Symbol
                </FormLabel>
                <FormInput
                    name = 'ticker'
                    type = 'text'
                    placeholder = 'e.g.: BTC, ETH, USD'
                    rules = {{
                            required: 'Ticker symbol is required.',
                            maxLength: {
                                value: 10,
                                message: 'Ticker cannot exceed 10 characters.'
                            }
                        }}
                    errorMessage = {formMethods.formState.errors.ticker?.message}
                />
            </div>

            {
                localeOptions.length > 1 && (
                <div className = 'py-2'>
                    <FormDropdown
                        name = 'locale'
                        label = 'Region/Locale'
                        options = {localeOptions}
                        required
                    />
                </div>)
            }

            <div className='pt-2'>
                <FormLabel
                    htmlFor = 'initialBalance'
                    helperText = 'Input amount must be a number greater than zero'
                    error = {formMethods.formState.errors.initialBalance}
                    required
                >
                    Initial Balance
                </FormLabel>
                <FormInput
                    name = 'initialBalance'
                    type = 'number'
                    step = 'any'
                    placeholder = '0.00'
                    rules = {{
                        required: 'Initial balance is required.',
                        validate: value => value > 0 || 'Balance values cannot be zero or below.'
                    }}
                    errorMessage = {formMethods.formState.errors.initialBalance?.message}
                />
            </div>
        </FormModal>
    );
};


export default AddAssetModal;