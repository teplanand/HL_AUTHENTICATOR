import { FC } from "react";
import Label from "../Label";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

const FileInput: FC<FileInputProps> = ({ 
  className = "", 
  onChange, 
  onBlur,
  name,
  id,
  label,
  required,
  error,
  helperText,
  disabled = false
}) => {
  return (
    <div className="relative">
      {label && (
        <Label htmlFor={id || name}>
          {label} {required && <span className="text-error-500">*</span>}
        </Label>
      )}
      <input
        type="file"
        id={id || name}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`focus:border-ring-brand-300  w-full overflow-hidden rounded border bg-transparent text-sm shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 ${
          error ? "border-error-500" : "border-gray-300 dark:border-gray-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      />
      {helperText && (
        <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FileInput;
