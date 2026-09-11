import React, { type LabelHTMLAttributes, type ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';


export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    /** The text or elements to display as the main label */
    children: ReactNode;

    /** Optional custom CSS classes to merge with default styles */
    className?: string;

    /** Mutes label styles to indicate a disabled field */
    disabled?: boolean;

    /** Changes label styles to indicate a field error state */
    error?: boolean | FieldError;

    /** Applies an optional helper text or sub-label beneath the main label text */
    helperText?: string;

    /** Links the label to a specific form input using its 'id' attribute */
    htmlFor?: string;
    
    /** Automatically appends a red asterisk to mark mandatory fields */
    required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
    children,
    className = '',
    disabled = false,
    error = false,
    helperText,
    htmlFor,
    required = false,
    ...props
}) => {
    // Dynamic color resolution based on state
    const textColor = disabled ?
        'text-slate-200 cursor-not-allowed' :
        error ?
            'text-rose-500' :
            'text-slate-500';
    
    return (
        <label
            htmlFor = {htmlFor}
            className = {`block text-xs font-bold uppercase tracking-wider mb-1 ${textColor} ${className}`}
            {...props}
        >
            {children}

            {
                required && (
                <span className = 'ml-1 text-rose-500 font-bold' aria-hidden = 'true' title = 'Required field'>
                    *
                </span>)
            }
            
            {
                helperText && (
                <span className = {`block text-[11px] font-normal normal-case tracking-normal mt-0.5 ${disabled ?
                        'text-slate-200' :
                        'text-slate-300'
                    }`}
                >
                    {helperText}
                </span>)
            }
        </label>
    );
};


export default Label;