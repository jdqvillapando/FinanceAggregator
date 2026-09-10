import { useState, useRef, useEffect, type ReactNode } from 'react';


export interface DropdownOption<T = string | number> {
    disabled?: boolean;
    icon?: ReactNode;
    label: string;
    value: T;
}

export interface DropdownProps<T = string | number> {
    align?: 'left' | 'right';
    className?: string;
    errorMessage?: string;
    label?: string;
    name?: string;
    options: DropdownOption<T>[];
    placeholder?: string;
    required?: boolean;
    selectedOption?: DropdownOption<T> | null;
    onSelect: (option: DropdownOption<T>) => void;
}

export const Dropdown = <T = string | number>({
    align = 'left',
    className = '',
    errorMessage,
    label,
    name,
    options,
    placeholder = 'Select an option',
    required = false,
    selectedOption,
    onSelect
}: DropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);
    
    const handleSelect = (option: DropdownOption<T>) => {
        if (option.disabled) return;
        onSelect(option);
        setIsOpen(false);
    };
    
    return (
        <div className = {`relative inline-block ${className}`} ref = {containerRef}>
            {
                label && (
                <label htmlFor = {name} className = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1'>
                    {label}               
                    {
                        required && (
                        <span className = 'ml-1 text-rose-500 font-bold' aria-hidden = 'true' title = 'Required field'>
                            *
                        </span>)
                    }
                </label>)
            }

            <button
                type = 'button'
                id = {name}
                onClick = {() => setIsOpen((prev) => !prev)}
                className = {`flex w-full items-center justify-between text-sm p-3 bg-slate-50 border rounded-xl outline-none transition-colors ${
                    errorMessage ?
                    'border-rose-400 focus:border-rose-500' :
                    'border-slate-200 focus:border-indigo-500'
                }`}
            >
                <span className={selectedOption ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="text-xs text-slate-400">▼</span>
            </button>
            
            {
                errorMessage && (
                <span className = 'text-rose-500 text-xs font-semibold mt-1 block'>
                    {errorMessage}
                </span>)
            }
            
            {
                isOpen && (
                <div
                    className={`absolute z-50 mt-2 w-full max-h-40 overflow-y-auto rounded-xl bg-white p-1 shadow-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700 ${
                        align === 'right' ?
                        'right-0' :
                        'left-0'
                    }`}
                    role = 'menu'
                >
                    {
                        options.map((option, idx) => (
                            <button
                                key = {idx}
                                type = 'button'
                                disabled = {option.disabled}
                                onClick = {() => handleSelect(option)}
                                className = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors'
                                role = 'menuitem'
                            >
                                {option.icon}<span>{option.label}</span>
                            </button>
                        ))
                    }
                </div>)
            }
        </div>
    );
};