import React from 'react';
import { Fab, FabProps } from '@mui/material';

const MuiFab: React.FC<FabProps> = (props) => {
  return <Fab color="primary" {...props} />;
};

export default MuiFab;
