import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        mt: 'auto',
        py: 3,
        textAlign: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2">
          © {currentYear} The InsuranceHacks. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 