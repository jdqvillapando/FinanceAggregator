import React from 'react';
import { Controller, useFormContext, type RegisterOptions } from 'react-hook-form';

import { Dropdown, type DropdownOption } from '../Dropdown';


interface FormDropdownProps {
    label?: string;
    name: string;
    options: DropdownOption[];
    placeholder?: string;
    required?: boolean;
    rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
}

const FormDropdown: React.FC<FormDropdownProps> = ({
    label,
    name,
    placeholder = 'Select an option',
    options,
    required = false,
    rules
}) => {
    const { control, formState: { errors } } = useFormContext();
    const errorMessage = errors[name]?.message as string | undefined;

    const validationRules = {
        required: required ? `${label || name} is required.` : false,
        ...rules
    };
    
    return (
        <div className='flex flex-col gap-1'>
            <Controller
                name = {name}
                control = {control}
                rules = {validationRules}
                render = {({ field }) => {
                    const selectedOption = options.find((opt) => opt.value === field.value);
                    
                    return (
                        <Dropdown
                            errorMessage = {errorMessage}
                            label = {label}
                            name = {name}
                            options = {options}
                            placeholder = {placeholder}
                            selectedOption = {selectedOption}
                            onSelect = {(opt) => field.onChange(opt.value)}
                        />
                    );
                }}
            />
        </div>
    );
};


export default FormDropdown;