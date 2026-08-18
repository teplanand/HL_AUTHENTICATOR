// components/common/LinearProgress.tsx
import Box from "@mui/material/Box";
import MuiLinearProgress from "@mui/material/LinearProgress";
import Backdrop from "@mui/material/Backdrop";

interface LinearProgressProps {
  isLoading?: boolean;
  withBackdrop?: boolean;
  backdropColor?: string;
  position?: 'fixed' | 'absolute' | 'sticky';
}

const LinearProgress = ({ 
  isLoading = true, 
  withBackdrop = false,
  backdropColor = "rgba(0, 0, 0, 0.1)", // Light black backdrop
  position = "fixed"
}: LinearProgressProps) => {
  if (!isLoading) return null;
  
  return (
    <>
      {withBackdrop && (
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: 9998,
            backgroundColor: backdropColor,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          open={isLoading}
        >
        </Backdrop>
      )}
      
      <Box 
        sx={{ 
          width: "100%", 
          position, 
          top: 0, 
          left: 0, 
          zIndex: 9999 
        }}
      >
        <MuiLinearProgress />
      </Box>
    </>
  );
};

export default LinearProgress;