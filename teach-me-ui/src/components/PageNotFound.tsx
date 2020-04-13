import React from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';


const PageNotFound = () => {

  return (
    <Box component='main' className='main-root-grid fade-in'>
      <Container>
        <h1>Sorry, the page you requested was not found!</h1>
      </Container>
    </Box>
  );
};

export default PageNotFound;
