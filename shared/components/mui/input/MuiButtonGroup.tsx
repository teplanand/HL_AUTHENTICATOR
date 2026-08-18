import React from 'react';
import { Button, ButtonGroup, ButtonGroupProps } from '@mui/material';

export type MuiButtonGroupProps = ButtonGroupProps & {
  buttons: { label: React.ReactNode; onClick?: () => void; value?: string; disabled?: boolean; type?: 'button' | 'submit' | 'reset' }[];
};

const MuiButtonGroup: React.FC<MuiButtonGroupProps> = ({ buttons, ...props }) => {
  return (
    <ButtonGroup variant="contained" aria-label="button group" {...props}>
      {buttons.map((btn, index) => (
        <Button key={index} type={btn.type || 'button'} onClick={btn.onClick} disabled={btn.disabled}>
          {btn.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default MuiButtonGroup;
