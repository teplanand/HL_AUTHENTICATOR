import React from 'react';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { SxProps, Theme } from '@mui/material/styles';


export type MuiDatePickerProps = Omit<DatePickerProps<any>, 'slotProps'> & {
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
  textFieldSx?: SxProps<Theme>;
};

const MuiDatePicker: React.FC<MuiDatePickerProps> = ({
  helperText,
  error,
  required,
  textFieldSx,
  ...props
}) => {
  const compactTextFieldSx: SxProps<Theme> = {
    '& .MuiFormLabel-root': {
      fontSize: '0.8rem',
      lineHeight: 1.2,
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.8rem',
      transform: 'translate(14px, 9px) scale(1)',
      maxWidth: 'calc(100% - 52px)',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
      transform: 'translate(14px, -7px) scale(0.85)',
      maxWidth: 'calc(100% - 28px)',
    },
    '& .MuiInputBase-root': {
      minHeight: 40,
      backgroundColor: '#fff',
    },
    '& .MuiInputBase-input': {
      padding: '9px 12px',
      fontSize: '0.8125rem',
    },
    '& .MuiOutlinedInput-notchedOutline legend': {
      maxWidth: '100%',
    },
  };

  return (
    <DatePicker
      format="DD/MM/YYYY"
      {...props}
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
          error,
          helperText,
          required,
          InputLabelProps: {
            shrink: true,
          },
          sx: [compactTextFieldSx, textFieldSx] as any,
        },
      }}
    />
  );
};

export default MuiDatePicker;
