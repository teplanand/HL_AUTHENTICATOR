import type React from "react";

interface RadioProps {
  id?: string;
  name?: string;
  value: string;
  checked: boolean;
  label: string;
  onChange?: (value: string | any) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  onBlur,
  className = "",
  disabled = false,
  required,
  error,
  helperText
}) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={id || value}
        className={`relative flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
          disabled
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            : error ? "text-error-500" : "text-gray-700 dark:text-gray-400"
        } ${className}`}
      >
        <input
          id={id || value}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={(e) => !disabled && onChange && onChange(e.target.value)} 
          onBlur={onBlur}
          className="sr-only"
          disabled={disabled} 
        />
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] ${
            checked
              ? "border-brand-500 bg-brand-500"
              : error ? "bg-transparent border-error-500" : "bg-transparent border-gray-300 dark:border-gray-700"
          } ${
            disabled
              ? "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700"
              : ""
          }`}
        >
          <span className={`h-2 w-2 rounded-full bg-white ${checked ? "block" : "hidden"}`}></span>
        </span>
        {label} {required && <span className="text-error-500">*</span>}
      </label>
      {helperText && (
        <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Radio;
