import React from 'react';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, FormHelperText, RadioGroupProps } from '@mui/material';

export type MuiRadioGroupProps = RadioGroupProps & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  options: { value: string | number; label: React.ReactNode }[];
};

const MuiRadioGroup: React.FC<MuiRadioGroupProps> = ({
  label,
  options,
  error,
  helperText,
  disabled,
  ...props
}) => {
  return (
    <FormControl error={error} disabled={disabled}>
      {label && <FormLabel>{label}</FormLabel>}
      <RadioGroup {...props}>
        {options.map((opt) => (
          <FormControlLabel key={opt.value} value={opt.value} control={<Radio />} label={opt.label} />
        ))}
      </RadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default MuiRadioGroup;
