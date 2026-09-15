import React from 'react';
import { useFormContext, type RegisterOptions } from 'react-hook-form';

import { Input, type InputProps } from '../Input';


interface FormInputProps extends Omit<InputProps, 'name'> {
    name: string;
    required?: boolean;
    rules?: RegisterOptions;
}

const FormInput: React.FC<FormInputProps> = ({
    name,
    rules,
    ...props
}) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    
    const errorMessage = errors[name]?.message as string | undefined;
    
    const validationRules: RegisterOptions = { ...rules };
    
    return (
        <Input
            {...props}
            {...register(name, validationRules)}
            name = {name}
            errorMessage = {errorMessage}
        />
    );
};


export default FormInput;