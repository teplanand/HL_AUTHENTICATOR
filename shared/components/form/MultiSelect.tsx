import type React from "react";
import { useState, useRef, useEffect } from "react";
import Label from "./Label";

interface Option {
  value: string;
  text: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[] | any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  value?: string[];
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  onBlur,
  disabled = false,
  name,
  id,
  value,
  required,
  error,
  helperText
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = value !== undefined;
  const currentSelected = isControlled ? value : selectedOptions;

  // Handle click outside to close dropdown and trigger onBlur
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

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    const newSelectedOptions = currentSelected.includes(optionValue)
      ? currentSelected.filter((v) => v !== optionValue)
      : [...currentSelected, optionValue];

    if (!isControlled) setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  const removeOption = (val: string) => {
    const newSelectedOptions = currentSelected.filter((opt) => opt !== val);
    if (!isControlled) setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  const selectedValuesText = currentSelected.map(
    (v) => options.find((option) => option.value === v)?.text || ""
  );

  let selectClasses = `mb-2 flex min-h-[44px] rounded border px-3 py-1.5 shadow-theme-xs outline-hidden transition `;

  if (disabled) {
    selectClasses += `bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700`;
  } else if (error) {
    selectClasses += `border-error-500 focus:border-error-300 focus:-error dark:border-error-500`;
  } else {
    selectClasses += `border-gray-300 focus:border-brand-500 dark:focus:border-brand-400 focus: dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-500 dark:focus:border-brand-400`;
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <Label htmlFor={id || name}>
          {label} {required && <span className="text-error-500">*</span>}
        </Label>
      )}

      <div className="relative z-20 inline-block w-full">
        <div className="relative flex flex-col items-center">
          <div onClick={toggleDropdown} className="w-full cursor-pointer">
            <div className={selectClasses}>
              <div className="flex flex-wrap flex-auto gap-2">
                {selectedValuesText.length > 0 ? (
                  selectedValuesText.map((text, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
                    >
                      <span className="flex-initial max-w-full">{text}</span>
                      <div className="flex flex-row-reverse flex-auto">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(currentSelected[index]);
                          }}
                          className={`${disabled ? 'hidden' : ''} pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400`}
                        >
                          <svg className="fill-current" role="button" width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <input
                    placeholder="Select option"
                    className="w-full h-full p-1 pr-2 text-sm bg-transparent border-0 outline-hidden appearance-none placeholder:text-gray-800 focus:border-0 focus:outline-hidden focus:ring-0 dark:placeholder:text-white/90 cursor-pointer"
                    readOnly
                    value="Select option"
                  />
                )}
              </div>
              <div className="flex items-center py-1 pl-1 pr-1 w-7">
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleDropdown(); }} className="w-5 h-5 text-gray-700 outline-hidden cursor-pointer focus:outline-hidden dark:text-gray-400">
                  <svg className={`stroke-current ${isOpen ? "rotate-180" : ""}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {isOpen && !disabled && (
            <div className="absolute left-0 z-40 w-full overflow-y-auto bg-white rounded shadow-sm top-[calc(100%-8px)] max-h-48 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col">
                {options.map((option, index) => (
                  <div key={index} className="hover:bg-primary/5 w-full cursor-pointer rounded-t border-b border-gray-100 dark:border-gray-700/50" onClick={() => handleSelect(option.value)}>
                    <div className={`relative flex w-full items-center p-2 pl-3 ${currentSelected.includes(option.value) ? "bg-brand-50/50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-white/90 hover:text-gray-900"}`}>
                      <div className="leading-6">{option.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {helperText && (
        <p className={`mt-0 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
