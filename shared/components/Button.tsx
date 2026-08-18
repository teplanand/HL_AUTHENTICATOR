// components/Button.tsx
import React from 'react';
import { Button as MuiButton } from '@mui/material';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      disabled={disabled}
      sx={{ borderRadius: '4px' }}
    >
      {children}
    </MuiButton>
  );
};

export default Button;