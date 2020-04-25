import React from 'react';
import { Link } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const Landing = () => {
  return (
    <Box className='fade-in'>
      <Box component='main' className='landing-main-box'>
        <Box component='section' className='landing-splash-box'>
          <Container>
            <Grid container direction='column'>
              <Box maxWidth='35rem'>
                <Typography component='h2' variant='h3'>
                  Welcome to Teach Me!
                </Typography>
                <br />
                <Typography component='span' variant='h6'>
                  An online Community where Students, Lecturers, Academics,
                  Universities converge!
                </Typography>
              </Box>
              <br />
              <br />
              <Box className='landing-splash-links-box'>
                <Link to='/signup'>JOIN NOW</Link>
                <Link to='/about'>LEARN MORE</Link>
              </Box>
            </Grid>
          </Container>
        </Box>

        <Box component='section'>
          <Container>Some Extra content below!</Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;
