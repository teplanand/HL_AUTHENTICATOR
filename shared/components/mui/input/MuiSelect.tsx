import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectProps } from '@mui/material';

export type MuiSelectProps = SelectProps & {
  options: { value: string | number; label: React.ReactNode }[];
  helperText?: React.ReactNode;
  placeholder?: React.ReactNode;
};

const MuiSelect: React.FC<MuiSelectProps> = ({ 
  options, 
  helperText, 
  placeholder,
  label, 
  error, 
  fullWidth = true, 
  size = "small",
  id,
  name,
  ...props 
}) => {
  const labelId = `${id || name}-label`;
  const currentValue = props.value ?? props.defaultValue;
  const hasValue =
    currentValue !== undefined &&
    currentValue !== null &&
    currentValue !== '';

  const renderDisplayValue = (selected: unknown): React.ReactNode => {
    if (selected === '' || selected === undefined || selected === null) {
      if (!placeholder) {
        return <span>&nbsp;</span>;
      }

      return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{placeholder}</span>;
    }

    const selectedOption = options.find((opt) => String(opt.value) === String(selected));
    if (selectedOption) {
      return selectedOption.label;
    }

    if (Array.isArray(selected)) {
      return selected.join(', ');
    }

    return String(selected);
  };

  return (
    <FormControl fullWidth={fullWidth} size={size} error={error} disabled={props.disabled}>
      {label && (
        <InputLabel
          id={labelId}
          shrink={Boolean(hasValue || placeholder)}
        >
          {label}
        </InputLabel>
      )}
      <Select
        labelId={labelId}
        id={id || name}
        name={name}
        label={label}
        renderValue={
          props.displayEmpty ? renderDisplayValue : props.renderValue
        }
        {...props}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default MuiSelect;
