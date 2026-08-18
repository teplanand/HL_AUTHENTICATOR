import { useState } from "react";
import Label from "./Label";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string | React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  name?: string;
  id?: string;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  onBlur,
  className = "",
  defaultValue = "",
  value,
  name,
  id,
  label,
  required,
  error,
  helperText,
  disabled
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : selectedValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!isControlled) setSelectedValue(val);
    if (onChange) onChange(e);
  };

  let selectClasses = ` w-full appearance-none rounded border bg-transparent px-3 py-1.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden  ${currentValue ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"} ${className}`;

  if (disabled) {
    selectClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    selectClasses += ` border-error-500 focus:border-error-300  dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else {
    selectClasses += ` border-gray-300 focus:border-brand-500 dark:focus:border-brand-400  dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      {label && (
        <Label htmlFor={id || name}>
          {label} {required && <span className="text-error-500">*</span>}
        </Label>
      )}
      <select
        id={id || name}
        name={name}
        className={selectClasses}
        value={currentValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
      >
        <option value="" disabled className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {option.label}
          </option>
        ))}
      </select>
      
      {helperText && (
        <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
