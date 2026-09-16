import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, type ButtonProps } from '../Button';


interface FormButtonProps extends Omit<ButtonProps, 'type'> {
    type?: 'submit' | 'reset' | 'button';
}

const FormButton: React.FC<FormButtonProps> = ({
    children,
    disabled,
    isLoading,
    type = 'submit',
    ...props
}) => {
    const formContext = useFormContext();
    
    // If used inside FormProvider, listen to native form submission states automatically
    const isSubmitting = formContext ? formContext.formState.isSubmitting : false;
    const isValid = formContext ? formContext.formState.isValid : true;
    
    return (
        <Button
            type = {type}
            isLoading = {isLoading ?? isSubmitting}
            disabled = {disabled || (type === 'submit' && !isValid)}
            {...props}
        >
            {children}
        </Button>
    );
};


export default FormButton;