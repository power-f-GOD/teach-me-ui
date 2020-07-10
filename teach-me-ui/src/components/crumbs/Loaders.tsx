import React from 'react';

import Col from 'react-bootstrap/Col';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

export const DISPLAY_INFO = 'DISPLAY_INFO';

export const Skeleton = (props: { type?: 'DISPLAY_INFO' | string }) => {
  switch (props.type) {
    case DISPLAY_INFO:
      return (
        <Col as='span' className='colleague-name skeleton-loader'>
          <Box component='span' className='chat-avatar mr-2' />
          <Box component='span' className='chat-display-name'></Box>
        </Col>
      );
    default:
      return <Box></Box>;
  }
};

const Loader = () => {
  return (
    <Box className='loader-wrapper fade-in'>
      <Box textAlign='center'>
        <Box>
          <CircularProgress color='inherit' size='3rem' thickness={4} />
        </Box>
        <Box fontSize='1.75rem' marginY='1em'>
          <Box component='span' className='logo gradient'>
            Kanyimuta!
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Loader;
