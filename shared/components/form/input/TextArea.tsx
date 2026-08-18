import React from "react";
import Label from "../Label";

interface TextareaProps {
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string | React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  name?: string;
  id?: string;
  required?: boolean;
  hint?: string;
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message",
  rows = 3,
  value = "",
  onChange,
  onBlur,
  className = "",
  disabled = false,
  error = false,
  helperText,
  label,
  name,
  id,
  required,
  hint = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e); 
    }
  };

  let textareaClasses = `w-full rounded border px-3 py-1.5 text-sm shadow-theme-xs focus:outline-hidden ${className} `;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed opacity40 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    textareaClasses += ` bg-transparent text-gray-900 border-error-500 focus:border-error-300   dark:border-error-500 dark:bg-gray-900 dark:text-white/90 dark:focus:border-error-800`;
  } else {
    textareaClasses += ` bg-transparent text-gray-900 dark:text-gray-300 text-gray-900 border-gray-300 focus:border-brand-500 dark:focus:border-brand-400   dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  const errorMsg = helperText || hint;

  return (
    <div className="relative">
      {label && (
        <Label htmlFor={id || name}>
          {label} {required && <span className="text-error-500">*</span>}
        </Label>
      )}
      <textarea
        id={id || name}
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={textareaClasses}
      />
      {errorMsg && (
        <p className={`mt-2 text-sm ${error ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}>
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default TextArea;
