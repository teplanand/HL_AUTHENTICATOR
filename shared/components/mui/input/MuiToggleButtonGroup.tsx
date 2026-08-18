import React from 'react';
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, FormControl, FormHelperText, FormLabel } from '@mui/material';

export type MuiToggleButtonGroupProps = ToggleButtonGroupProps & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  options: { value: any; label: React.ReactNode }[];
};

const MuiToggleButtonGroup: React.FC<MuiToggleButtonGroupProps> = ({ label, options, error, helperText, ...props }) => {
  return (
    <FormControl error={error} disabled={props.disabled} fullWidth={props.fullWidth}>
      {label && <FormLabel>{label}</FormLabel>}
      <ToggleButtonGroup size="small" {...props}>
        {options.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default MuiToggleButtonGroup;
