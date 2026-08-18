import { useState } from "react";

interface SwitchProps {
  label?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  value?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  onChange?: (checked: boolean | any) => void;
  onBlur?: () => void;
  color?: "blue" | "gray";
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  checked,
  value,
  name,
  id,
  disabled = false,
  onChange,
  onBlur,
  color = "blue",
  required,
  error,
  helperText
}) => {
  const isControlled = checked !== undefined || value !== undefined;
  const initialChecked = isControlled ? (checked ?? Boolean(value)) : defaultChecked;
  const [internalChecked, setInternalChecked] = useState(initialChecked);

  const currentChecked = isControlled ? (checked ?? Boolean(value)) : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newCheckedState = !currentChecked;
    if (!isControlled) setInternalChecked(newCheckedState);
    if (onChange) onChange(newCheckedState);
    if (onBlur) onBlur(); // Toggle implies blur
  };

  const switchColors =
    color === "blue"
      ? {
          background: currentChecked ? "bg-brand-500 " : "bg-gray-200 dark:bg-white/10",
          knob: currentChecked ? "translate-x-full bg-white" : "translate-x-0 bg-white",
        }
      : {
          background: currentChecked ? "bg-gray-800 dark:bg-white/10" : "bg-gray-200 dark:bg-white/10",
          knob: currentChecked ? "translate-x-full bg-white" : "translate-x-0 bg-white",
        };

  return (
    <div className="flex flex-col">
      <label
        className={`flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
          disabled ? "text-gray-400" : error ? "text-error-500" : "text-gray-700 dark:text-gray-400"
        }`}
        onClick={handleToggle} 
      >
        <div className="relative">
          <div
            className={`block transition duration-150 ease-linear h-6 w-11 rounded-full ${
              disabled ? "bg-gray-100 pointer-events-none dark:bg-gray-800" : switchColors.background
            } ${error ? "ring-2 ring-error-500" : ""}`}
          ></div>
          <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-sm duration-150 ease-linear transform ${switchColors.knob}`}></div>
        </div>
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

export default Switch;
