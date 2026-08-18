import React from 'react';

interface SwitchInputProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'error';
}

const SwitchInput: React.FC<SwitchInputProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'medium',
  color = 'primary'
}) => {
  const handleChange = () => {
    if (disabled) return;
    onChange && onChange();
  };

  // Size configurations
  const sizeConfig = {
    small: {
      width: 'w-10',
      height: 'h-5',
      beforeSize: 'before:w-3 before:h-3',
      beforePosition: 'before:left-0.5 before:bottom-0.5'
    },
    medium: {
      width: 'w-12',
      height: 'h-6',
      beforeSize: 'before:w-4 before:h-4',
      beforePosition: 'before:left-1 before:bottom-1'
    },
    large: {
      width: 'w-14',
      height: 'h-7',
      beforeSize: 'before:w-5 before:h-5',
      beforePosition: 'before:left-1 before:bottom-1'
    }
  };

  // Color configurations
  const colorConfig = {
    primary: {
      on: 'bg-blue-500 border-blue-500',
      off: 'bg-gray-400 border-gray-400'
    },
    secondary: {
      on: 'bg-purple-500 border-purple-500',
      off: 'bg-gray-400 border-gray-400'
    },
    success: {
      on: 'bg-green-500 border-green-500',
      off: 'bg-red-500 border-red-500'
    },
    error: {
      on: 'bg-green-500 border-green-500',
      off: 'bg-red-500 border-red-500'
    }
  };

  const currentSize = sizeConfig[size];
  const currentColor = colorConfig[color];

  return (
    <div className="flex items-center justify-center">
      <label className={`${currentSize.width} ${currentSize.height} relative`}>
        <input
          type="checkbox"
          className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <span
          className={`outline_checkbox border-2 block h-full rounded-full
            before:absolute ${currentSize.beforePosition} ${currentSize.beforeSize} before:rounded-full before:bg-white before:bg-no-repeat before:bg-center
            before:transition-all before:duration-300 peer-checked:before:left-7
            ${checked ? currentColor.on : currentColor.off}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        ></span>
      </label>
    </div>
  );
};

export default SwitchInput;