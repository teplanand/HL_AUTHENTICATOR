import React from 'react';
import { Box, FormHelperText, FormLabel, Typography } from '@mui/material';
import DateRangePicker, {
  DateRange,
} from '../../common/DateRangePicker';

export type MuiDateRangePickerProps = {
  label?: React.ReactNode;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
};

const MuiDateRangePicker: React.FC<MuiDateRangePickerProps> = ({
  label,
  value,
  onChange,
  helperText,
  error,
  required,
}) => {
  return (
    <Box>
      {label ? (
        <FormLabel >
          {label}
          {required ? <Typography component="span" color="error.main">*</Typography> : null}
        </FormLabel>
      ) : null}

      <Box
        sx={{
           
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
      
          backgroundColor: 'background.paper',
        }}
      >
        <DateRangePicker
          initialRange={value}
          onDateRangeChange={(range) => onChange?.(range)}
        />
      </Box>

       

      {helperText ? (
        <FormHelperText error={error} sx={{ mt: 0.5 }}>
          {helperText}
        </FormHelperText>
      ) : null}
    </Box>
  );
};

export default MuiDateRangePicker;
