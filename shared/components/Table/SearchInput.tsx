import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchInputProps {
    search: string | undefined;
    setSearch: (value: string | undefined) => void;
}

const SearchInput = ({ search, setSearch }: SearchInputProps) => {
    return (
        <TextField
            placeholder="Search..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
                width: '100%',
                maxWidth: 240,
                '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
                    backgroundColor: 'background.paper',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: 1,
                    },
                },
            }}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: 20
                                }}
                            />
                        </InputAdornment>
                    ),
                }
            }}
        />
    );
};

export default SearchInput;