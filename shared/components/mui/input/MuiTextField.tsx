import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type MuiTextFieldProps = TextFieldProps & {
  // Can effortlessly accept getFieldProps from useForm
};

const MuiTextField: React.FC<MuiTextFieldProps> = (props) => {
  const { InputLabelProps, ...restProps } = props;

  return (
    <TextField 
      fullWidth 
      variant="outlined" 
      size="small"
      InputLabelProps={{
        shrink: true,
        ...InputLabelProps,
      }}
      {...restProps} 
    />
  );
};

export default MuiTextField;
