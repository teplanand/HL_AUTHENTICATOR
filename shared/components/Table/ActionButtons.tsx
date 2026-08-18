import { Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ButtonProps {
    onClick: () => void;
    name: string;
    icon?: React.ReactNode;
}

interface ActionButtonsProps {
    buttons?: ButtonProps[];
}

const ActionButtons = ({ buttons }: ActionButtonsProps) => {
    if (!buttons || buttons.length === 0) return null;

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {buttons.map((item, index) => (
                <Button
                    key={index}
                    variant="contained"
                    startIcon={item.icon || <AddIcon />}
                    onClick={item.onClick}
                    sx={{
                        backgroundColor: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        whiteSpace: 'nowrap',
                        minWidth: 'auto',
                        px: 2,
                        py: 1,
                        borderRadius: '4px',
                        textTransform: 'none',
                        fontWeight: 'normal',
                        boxShadow: 'none',
                        '&:focus': {
                            outline: '2px solid',
                            outlineColor: 'primary.light',
                            outlineOffset: '2px',
                        },
                    }}
                >
                    {item.name}
                </Button>
            ))}
        </Box>
    );
};

export default ActionButtons;