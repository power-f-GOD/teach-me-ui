import React from 'react';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

const Footer = () => {
  return (
    <Box component='footer'>
      <MinorFooter />
    </Box>
  );
};

function MinorFooter() {
  return (
    <Box className='minor'>
      <Container>
        <Grid container direction='row' justify='space-evenly'>
          <Grid item component='section'>
            <Box component='span'>
              <Box className='logo grey'>Kanyimuta!</Box> &copy; 2020
            </Box>
            <Box marginBottom='2.5rem' className='web-address'>
              <Link to='/'>https://www.kanyimuta.com</Link>
            </Box>
          </Grid>
          <Grid item component='section'>
            <Grid container direction='column'>
              <Grid item>
                <Box fontWeight='bold' marginBottom='1rem'>
                  Navigation
                </Box>
              </Grid>
              <Grid item container direction='column'>
                <Grid item>
                  <Link to='/'>Home</Link>
                </Grid>
                <Grid item>
                  <Link to='/about'>About</Link>
                </Grid>
                <Grid item>
                  <Link to='/support'>Support</Link>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer;
