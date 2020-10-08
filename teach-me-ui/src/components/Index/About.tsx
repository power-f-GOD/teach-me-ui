import React from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

const About = () => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);

  return (
    <Box className='fade-in' paddingY='100px'>
      <Container>
        <h1>ABOUT component goes here!</h1>
        <h1>And more ABOUT component content goes here!</h1>
      </Container>
    </Box>
  );
};

export default About;
