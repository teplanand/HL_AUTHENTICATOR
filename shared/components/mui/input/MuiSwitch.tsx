import React from 'react';
import { FormControlLabel, Switch, SwitchProps, FormControl, FormHelperText } from '@mui/material';

export type MuiSwitchProps = SwitchProps & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
};

const MuiSwitch: React.FC<MuiSwitchProps> = ({ label, error, helperText, value, ...props }) => {
  // Map value to checked natively for robust form connection
  const isChecked = props.checked ?? Boolean(value);
  return (
    <FormControl error={error} disabled={props.disabled}>
      <FormControlLabel
        control={<Switch checked={isChecked} {...props} />}
        label={label}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default MuiSwitch;
