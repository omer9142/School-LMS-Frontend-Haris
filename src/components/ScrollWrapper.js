// src/components/ScrollWrapper.jsx
import React from 'react';
import { Box } from '@mui/material';

const ScrollWrapper = ({ children, sx = {}, maxWidth = null }) => {
  return (
    <Box
      className="scroll-container" // ADD THIS LINE
      sx={{
        width: '100%',
        minHeight: '100vh',
        overflowY: '100%',
        overflowX: 'hidden',
        padding: 0,
        ...(maxWidth && {
          maxWidth,
          margin: '0 auto'
        }),
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default ScrollWrapper;