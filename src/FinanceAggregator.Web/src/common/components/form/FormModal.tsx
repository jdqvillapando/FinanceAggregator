import React, { type ReactNode } from 'react';
import { FormProvider, type FieldValues, type FormState, type UseFormReturn } from 'react-hook-form';

import { Modal, type ModalProps } from '../Modal';


interface FormModalProps<TFieldValues extends FieldValues> extends Omit<ModalProps, 'children'> {
    // Allows passing children by either standard JSX or a render function that receives form methods
    children: ReactNode |
        ((methods: {
            register: UseFormReturn<TFieldValues>['register'];
            formState: FormState<TFieldValues>;
        }) => ReactNode);
    isSubmitting?: boolean;
    methods: UseFormReturn<TFieldValues>;
    serverErrorsMsg?: string | null;
    submitLabel?: string;
    onSubmit: (data: TFieldValues) => void | Promise<void>;
}

const FormModal = <TFieldValues extends FieldValues>(
    {
        children,
        isOpen,
        methods,
        serverErrorsMsg = null,
        submitLabel = 'Submit',
        title,
        onClose,
        onSubmit
    }: FormModalProps<TFieldValues>
): React.JSX.Element | null => {
    const { register, handleSubmit, formState } = methods;
    const { isSubmitting } = formState;
    
    return (
        <Modal isOpen = {isOpen} onClose = {onClose} title = {title}>
            {
                serverErrorsMsg &&
                (<div className = 'p-3 mb-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl'>
                    {serverErrorsMsg}
                </div>)
            }

            <FormProvider {...methods}>
                {/* noValidate stops native browser tooltips so React Hook Form handles errors */}
                <form className = 'space-y-4' onSubmit = {handleSubmit(onSubmit)} noValidate>
                    <div>
                        { typeof children === 'function' ? children({ register, formState }) : children }
                    </div>
                    
                    <div className = 'flex justify-end space-x-3 pt-4 border-t border-slate-100'>
                        <button
                            type = 'button'
                            onClick = {onClose}
                            disabled = {isSubmitting}
                            className = 'px-4 py-2 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50'
                        >
                            Cancel
                        </button>
                        
                        <button
                            type = 'submit'
                            disabled = {isSubmitting}
                            className = 'px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-sm shadow-indigo-100 transition-colors flex items-center justify-center'
                        >
                            { isSubmitting ? 'Please wait...' : submitLabel }
                        </button>
                    </div>
                </form>
            </FormProvider>
        </Modal>
    );
};


export default FormModal;