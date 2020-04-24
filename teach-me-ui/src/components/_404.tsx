import React from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';


const _404 = () => {
  return (  
    <Box component='main' className='main-root-grid fade-in' data-testid='_404'>
      <Container>
        <h1>Sorry, the page you requested was not found!</h1>
      </Container>
    </Box>
  );
};

export default _404;
