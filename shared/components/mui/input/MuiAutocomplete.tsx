import React from 'react';
import { Autocomplete, TextField, AutocompleteProps } from '@mui/material';

export type MuiAutocompleteProps<T, Multiple extends boolean | undefined, DisableClearable extends boolean | undefined, FreeSolo extends boolean | undefined> = 
  Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'> & {
    label?: string;
    error?: boolean;
    helperText?: React.ReactNode;
    placeholder?: string;
    required?: boolean;
  };

const MuiAutocomplete = <
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false
>({
  label,
  error,
  helperText,
  placeholder,
  required,
  ...props
}: MuiAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) => {
  return (
    <Autocomplete
      size="small"
      {...props}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          required={required}
          name={props.id || 'autocomplete'}
        />
      )}
    />
  );
};

export default MuiAutocomplete;
