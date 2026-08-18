import type React from "react";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  value?: boolean;
  className?: string;
  id?: string;
  name?: string;
  onChange?: (checked: boolean | any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  value,
  id,
  name,
  onChange,
  onBlur,
  className = "",
  disabled = false,
  required,
  error,
  helperText
}) => {
  const isChecked = checked ?? Boolean(value);

  return (
    <div className="flex flex-col">
      <label
        className={`flex items-center space-x-3 group cursor-pointer ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <div className="relative w-5 h-5">
          <input
            id={id || name}
            name={name}
            type="checkbox"
            className={`w-5 h-5 appearance-none cursor-pointer border ${error ? "border-error-500" : "border-gray-300 dark:border-gray-700"} checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60 
            ${className}`}
            checked={isChecked}
            onChange={(e) => {
              if (onChange) onChange(e.target.checked);
            }}
            onBlur={onBlur}
            disabled={disabled}
          />
          {isChecked && (
            <svg className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {disabled && (
            <svg className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#E4E7EC" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        {label && (
          <span className={`text-sm font-medium ${error ? "text-error-500" : "text-gray-800 dark:text-gray-200"}`}>
            {label} {required && <span className="text-error-500">*</span>}
          </span>
        )}
      </label>
      {helperText && (
        <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Checkbox;
