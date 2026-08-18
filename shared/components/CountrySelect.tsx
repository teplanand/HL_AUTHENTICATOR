import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  CircularProgress,
  InputAdornment,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface OptionType {
  value?: string;
  label?: string;
  id?: string | number;
  name?: string;
}

interface SearchableAutocompleteProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  options: OptionType[];
  error: boolean;
  helperText?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  label: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearch: (searchText: string) => void;
  placeholder?: string;
}
const SearchableAutocomplete: React.FC<SearchableAutocompleteProps> = ({
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  helperText,
  isDisabled = false,
  isLoading = false,
  label,
  hasMore = false,
  onLoadMore,
  onSearch,
  placeholder = "Search...",
}) => {
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0); // ✅ FIX: Force re-render ke liye
  const theme = useTheme();

  // ✅ FIX: Value change pe component refresh karo
  useEffect(() => {
    if (value) {
      setKey((prev) => prev + 1);
    }
  }, [value]);

  // ✅ FIX: Selected option ko properly find karein
  const selectedOption = React.useMemo(() => {
    if (!value) return null;

    if (!options || !Array.isArray(options)) {
      return null;
    }

    const found = options.find((option) => {
      if (option.value && option.value === value) return true;
      if (option.id && option.id.toString() === value) return true;
      return false;
    });

    return found || null;
  }, [value, options, name, key]); // ✅ FIX: key add karo

  // ✅ FIX: Input value control karein
  const inputValue = React.useMemo(() => {
    if (selectedOption) {
      return selectedOption.label || selectedOption.name || "";
    }
    return searchText;
  }, [selectedOption, searchText]);

  // ✅ FIX: Options ko properly format karein
  const formattedOptions = React.useMemo(() => {
    if (!options || !Array.isArray(options)) {
      return [];
    }

    const seen = new Set();
    return options
      .map((option) => {
        const value = option.value || option.id?.toString() || "";
        const label = option.label || option.name || "";

        const key = `${value}-${label}`;
        if (seen.has(key)) return null;
        seen.add(key);

        return { value, label };
      })
      .filter(Boolean);
  }, [options, name]);

  // ✅ FIX: Search with delay
  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        onSearch(searchText);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchText, open, onSearch]);

  // ✅ FIX: Option select karna
  const handleChange = (_: any, newValue: any) => {
    if (newValue) {
      const selectedValue = newValue.value || newValue.id?.toString() || "";
      onChange(selectedValue);
      setSearchText("");
    } else {
      onChange("");
    }
  };

  // ✅ FIX: Input change handle karna
  const handleInputChange = (_: any, newInputValue: string) => {
    setSearchText(newInputValue);
  };

  // ✅ FIX: Option label display karna
  const getOptionLabel = (option: any) => {
    if (typeof option === "string") return option;
    return option.label || option.name || "";
  };

  // ✅ FIX: Option comparison
  const isOptionEqualToValue = (option: any, value: any) => {
    const optionValue = option.value || option.id?.toString() || "";
    const valueValue = value?.value || value?.id?.toString() || "";
    return optionValue === valueValue;
  };

  return (
    <Autocomplete
      key={key} // ✅ FIX: Force re-render ke liye
      size="small"
      open={open}
      onOpen={() => {
        setOpen(true);
        // ✅ FIX: Open hone pe empty search karo taaki saare options load ho
        if (searchText === "") {
          onSearch("");
        }
      }}
      onClose={() => {
        setOpen(false);
      }}
      value={selectedOption}
      inputValue={inputValue}
      options={formattedOptions}
      disabled={isDisabled}
      loading={isLoading}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterOptions={(x) => x}
      onChange={handleChange}
      onInputChange={handleInputChange}
      popupIcon={<ExpandMoreIcon />}
      PaperComponent={(props) => (
        <Paper
          {...props}
          elevation={8}
          sx={{
            mt: 0.5,
            borderRadius: '4px',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {props.children}
          {hasMore && (
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer" }}
                onClick={onLoadMore}
              >
                Load More...
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      noOptionsText={
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {isLoading ? "Loading..." : "No options found"}
          </Typography>
        </Box>
      }
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          error={error}
          helperText={helperText}
          onBlur={onBlur}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      ListboxProps={{
        onScroll: (event) => {
          const listboxNode = event.currentTarget;
          if (
            hasMore &&
            onLoadMore &&
            listboxNode.scrollTop + listboxNode.clientHeight >=
            listboxNode.scrollHeight - 50
          ) {
            onLoadMore();
          }
        },
      }}
    />
  );
};
export default SearchableAutocomplete;
