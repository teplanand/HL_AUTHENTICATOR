import React, { useState, useRef, useEffect } from "react";
import Label from "../Label";

interface Option {
  value: string;
  text: string;
}

interface AutoSuggestProps {
  options: Option[];
  placeholder?: string;
  label?: string;
  name?: string;
  id?: string;
  value?: string;
  onChange?: (value: string | any) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const AutoSuggest: React.FC<AutoSuggestProps> = ({
  options,
  placeholder = "Search...",
  label,
  name,
  id,
  value = "",
  onChange,
  onBlur,
  className = "",
  disabled = false,
  required,
  error,
  helperText,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? value : internalValue;

  const filteredOptions = options.filter(opt => 
    opt.text.toLowerCase().includes(currentValue.toLowerCase())
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          if (onBlur) onBlur();
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onBlur]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (value === undefined) setInternalValue(val);
    if (onChange) onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectOption = (opt: Option) => {
    if (value === undefined) setInternalValue(opt.text); 
    if (onChange) onChange(opt.value);
    setIsOpen(false);
  };

  let inputClasses = `w-full rounded border appearance-none px-3 py-1.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-hidden dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` border-error-500 focus:border-error-500 dark:text-error-400 dark:border-error-500`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-500 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-400`;
  }

  const displayValue = options.find(o => o.value === currentValue)?.text || currentValue;

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <Label htmlFor={id || name}>
          {label} {required && <span className="text-error-500">*</span>}
        </Label>
      )}

      <div className="relative z-20">
        <input
          id={id || name}
          name={name}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
          className={inputClasses}
        />
        
        {isOpen && !disabled && filteredOptions.length > 0 && (
          <div className="absolute left-0 z-40 w-full overflow-y-auto bg-white rounded shadow-sm top-[calc(100%+4px)] max-h-48 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col py-1">
              {filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className="px-3 py-2 cursor-pointer hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => handleSelectOption(option)}
                >
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {helperText && (
        <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default AutoSuggest;
