import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type PropsType = {
  id?: string;
  name?: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => void;
  onBlur?: () => void;
  defaultDate?: flatpickr.Options.DateOption;
  value?: any;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

export default function DatePicker({
  id,
  name,
  mode,
  onChange,
  onBlur,
  label,
  defaultDate,
  value,
  placeholder,
  required,
  error,
  helperText,
  disabled
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = id || name || "datepicker";

  useEffect(() => {
    if (!inputRef.current) return;

    const flatPickr = flatpickr(inputRef.current, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      altInputClass: inputClasses,
      defaultDate: defaultDate || value,
      onChange: (selectedDates, dateStr, instance) => {
        if (onChange) onChange(selectedDates, dateStr, instance);
      },
      onClose: () => {
        if (onBlur) onBlur();
      }
    });

    return () => {
      if (flatPickr && typeof flatPickr.destroy === 'function') {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, onBlur, defaultDate]);

  let inputClasses = "  w-full rounded border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 ";

  if (disabled) {
    inputClasses += "opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-700";
  } else if (error) {
    inputClasses += "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500";
  } else {
    inputClasses += "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800";
  }

  return (
    <div>
      {label && (
        <Label htmlFor={inputId}>
          {label} {required && <span className="text-error-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <input
          id={inputId}
          name={name}
          ref={inputRef}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>

      {helperText && (
        <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
