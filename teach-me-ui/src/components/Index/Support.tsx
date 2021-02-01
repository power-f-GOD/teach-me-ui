import React from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

const Support = () => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);

  return (
    <Box className='fade-in' paddingY='100px' minHeight='100vh'>
      <Container>
        <h1>SUPPORT coming soon!</h1>
      </Container>
    </Box>
  );
};

export default Support;
