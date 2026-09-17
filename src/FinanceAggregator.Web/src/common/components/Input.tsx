import React, { type InputHTMLAttributes } from 'react';


export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    errorMessage?: string;
}

export const Input: React.FC<InputProps> = ({
    className = '',
    disabled = false,
    errorMessage,
    id,
    ...props
}) => {
    const inputId = id || props.name;

    const borderColor = disabled ?
        'text-slate-400 bg-slate-100 cursor-not-allowed' :
        errorMessage ?
            'text-slate-800 bg-slate-50 border-rose-400 focus:border-rose-500' :
            'text-slate-800 bg-slate-50 border-slate-200 focus:border-indigo-500';
    
    return (
        <div className = 'flex flex-col gap-1 w-full'>
            <input
                id = {inputId}
                disabled = {disabled}
                className = {`text-sm p-3 border rounded-xl outline-none font-medium transition-colors ${borderColor} ${className}`}
                {...props}
            />
            
            {
                errorMessage && (
                <span className = 'text-rose-500 text-xs font-semibold mt-1 block'>
                    {errorMessage}
                </span>)
            }
        </div>
    );
};