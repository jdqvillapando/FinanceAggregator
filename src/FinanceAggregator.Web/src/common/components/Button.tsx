import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';


export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
    isLoading?: boolean;
    loadingText?: string;
    overrideBaseStyling?: boolean;
    showSpinner?: boolean;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'none';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    disabled = false,
    isLoading = false,
    loadingText,
    overrideBaseStyling = false,
    showSpinner = false,
    type = 'button',
    variant = 'none',
    ...props
}) => {
    // Base structural styles shared across all variants
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none select-none p-3 text-sm';
    
    // Default color palette map (allows easy overrides via variant or custom className)
    const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
        primary: 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700',
        secondary: 'bg-slate-50 text-slate-500 hover:bg-slate-100',
        success: 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700',
        danger: 'bg-rose-600 text-white shadow-rose-100 hover:bg-rose-700',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
        none: '',
    };
    
    const selectedVariantClass = variantStyles[variant];

    const consolidatedClassName = overrideBaseStyling ? className : `${baseStyles} ${className}`;

    const spinner = showSpinner ? (
                <svg className = 'animate-spin h-4 w-4 text-current' viewBox = '0 0 24 24' fill = 'none'>
                    <circle className = 'opacity-25' cx = '12' cy = '12' r = '10' stroke = 'currentColor' strokeWidth = '4' />
                    <path
                        className = 'opacity-75'
                        fill = 'currentColor'
                        d = 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                </svg>
                ) :
                <></>;
    
    return (
        <button
            type = {type}
            disabled = {disabled || isLoading}
            className = {`${consolidatedClassName} ${selectedVariantClass}`}
            {...props}
        >
            {
                isLoading ? (
                <span className = 'flex items-center gap-2'>
                    {spinner} {loadingText || children}
                </span>) :
                (children)
            }
        </button>
    );
};