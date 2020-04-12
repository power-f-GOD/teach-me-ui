import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

const Loader = () => {
  return (
    <div className='loader-wrapper fade-in'>
      <Box textAlign='center'>
        <CircularProgress color='inherit' size='3.25rem' thickness={4} />
        <Box className='logo' fontSize='1.75rem' marginY='0.75em'>
          Teach Me!
        </Box>
      </Box>
    </div>
  );
};

export default Loader;
