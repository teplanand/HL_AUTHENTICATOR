import React, { useState, useCallback, useMemo } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FormControl,
  FormHelperText,
  Box,
  InputAdornment,
  SxProps,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";

interface MobileInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (data: {
    rawNumber: string;
    countryCode: string;
    dialCode: string;
    fullNumber: string;
  }) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
  required?: boolean;
  name?: string;
  placeholder?: string;
  endAdornment?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
}

const MobileInput: React.FC<MobileInputProps> = React.memo(
  ({
    id,
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    size = "small",
    sx,
    required,
    name = "phone",
    placeholder = "Enter mobile number",
    endAdornment,
    disabled = false,
    fullWidth = true,
  }) => {
    const [countryCode, setCountryCode] = useState("in");
    const [dialCode, setDialCode] = useState("91");
    const [isFocused, setIsFocused] = useState(false);
    const [hasTyped, setHasTyped] = useState(false);

    const isTablet = useMediaQuery("(max-width:1024px)");
    const hidePlaceholder = useMediaQuery("(max-width:768px)"); // New media query for 768px

    const handleChange = useCallback(
      (val: string, country: any) => {
        const dial = country?.dialCode || "91";
        const code = country?.countryCode || "in";
        const fullNumber = `+${val}`;
        const rawNumber = val.startsWith(dial)
          ? val.slice(dial.length)
          : val;

        setDialCode(dial);
        setCountryCode(code);

        setHasTyped(rawNumber.length > 0);

        onChange({
          rawNumber,
          countryCode: code,
          dialCode: dial,
          fullNumber,
        });
      },
      [onChange]
    );

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
      },
      [onBlur]
    );

    const inputStyle = useMemo(
      () => ({
        width: "100%",
        height: size === "small" ? "36px" : "56px",
        fontSize: "0.875rem",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        border: "none",
        outline: "none",
        background: "transparent",
        paddingRight: endAdornment ? "40px" : "12px",
        color: disabled ? "rgba(0, 0, 0, 0.38)" : "#212121",
        cursor: disabled ? "not-allowed" : "text",
      }),
      [size, endAdornment, disabled]
    );

    const containerStyle = useMemo(
      () => ({
        width: fullWidth ? "100%" : "auto",
        position: "relative" as const,
        display: "flex" as const,
        alignItems: "center" as const,
      }),
      [fullWidth]
    );

    const showPlaceholder = useMemo(() => {
      // Don't show placeholder if screen is 768px or smaller
      if (hidePlaceholder) return false;

      if (hasTyped) return false;
      if (!value) return true;
      const cleaned = value.replace("+", "");
      return cleaned.length <= dialCode.length;
    }, [value, dialCode, hasTyped, hidePlaceholder]);

    return (
      <Box sx={sx}>
        <FormControl
          fullWidth={fullWidth}
          error={error}
          size={size}
          disabled={disabled}
        >
          {label && (
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                fontWeight: 500,
                color: disabled
                  ? "text.disabled"
                  : error
                    ? "error.main"
                    : "text.primary",
              }}
            >
              {label}
              {required && (
                <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
                  *
                </Box>
              )}
            </Typography>
          )}

          {/* Input Container */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              border: "1px solid",
              borderColor: disabled
                ? "rgba(0, 0, 0, 0.12)"
                : error
                  ? "error.main"
                  : isFocused
                    ? "primary.main"
                    : "rgba(0, 0, 0, 0.23)",
              borderRadius: "4px",
              backgroundColor: disabled ? "rgba(0, 0, 0, 0.04)" : "white",
              transition: "border-color 200ms ease",
              "&:hover": {
                borderColor: disabled
                  ? "rgba(0, 0, 0, 0.12)"
                  : error
                    ? "error.main"
                    : isFocused
                      ? "primary.main"
                      : "rgba(0, 0, 0, 0.87)",
              },
            }}
          >
            {/* Conditionally render placeholder */}
            {showPlaceholder && (
              <Typography
                sx={{
                  position: "absolute",
                  left: isTablet ? 75 : 85,
                  color: "rgba(0, 0, 0, 0.6)",
                  pointerEvents: "none",
                  fontSize: "0.875rem",
                  userSelect: "none",
                  transition: "opacity 0.2s ease",
                }}
              >
                {placeholder}
              </Typography>
            )}

            <PhoneInput
              country={countryCode}
              value={value || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              enableSearch
              searchPlaceholder="Search country"
              placeholder=""
              inputProps={{
                id,
                name,
                required,
                disabled,
                style: inputStyle,
              }}
              containerStyle={containerStyle}
              dropdownStyle={{
                zIndex: 1500,
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              }}
              buttonStyle={{
                background: "transparent",
                border: "none",
                padding: "0 8px",
              }}
              inputStyle={inputStyle}
              disabled={disabled}
            />

            {endAdornment && (
              <InputAdornment
                position="end"
                sx={{
                  position: "absolute",
                  right: 12,
                  color: disabled ? "rgba(0, 0, 0, 0.38)" : "inherit",
                }}
              >
                {endAdornment}
              </InputAdornment>
            )}
          </Box>

          {helperText && (
            <FormHelperText
              sx={{
                mx: 0,
                mt: 0.5,
                color: disabled
                  ? "text.disabled"
                  : error
                    ? "error.main"
                    : "text.secondary",
              }}
            >
              {helperText}
            </FormHelperText>
          )}
        </FormControl>
      </Box>
    );
  }
);

MobileInput.displayName = "MobileInput";

export default MobileInput;