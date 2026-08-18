import React from 'react';
import { FormControlLabel, Checkbox, CheckboxProps, FormControl, FormHelperText } from '@mui/material';

export type MuiCheckboxProps = CheckboxProps & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
};

const MuiCheckbox: React.FC<MuiCheckboxProps> = ({ label, error, helperText, ...props }) => {
  return (
    <FormControl error={error} disabled={props.disabled}>
      <FormControlLabel
        control={<Checkbox {...props} />}
        label={label}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default MuiCheckbox;
