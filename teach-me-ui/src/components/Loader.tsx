import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

const Loader = () => {
  return (
    <Box className='loader-wrapper fade-in'>
      <Box textAlign='center'>
        <Box>
          <CircularProgress color='inherit' size='3rem' thickness={4} />
        </Box>
        <Box  fontSize='1.75rem' marginY='1em'>
          <Box component='span' className='logo light-blue'>Kanyimuta!</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Loader;
