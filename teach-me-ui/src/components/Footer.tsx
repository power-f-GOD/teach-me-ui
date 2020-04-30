import React from 'react';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

const Footer = (props: any) => {
  const forAuthComponent = /auth/i.test(props.for);

  return (
    <Box component='footer'>
      {!forAuthComponent ? <MajorFooter /> : null}
      {/* <hr /> */}
      {<MinorFooter />}
    </Box>
  );
};

function MajorFooter() {
  return (
    <Box className='major'>
      <Container>
        <Box className='major-box-wrapper'>
          <Box component='section' className='logo-section'>
            <Typography
              className='logo theme-color-primary-darker'
              component='h5'>
              Teach Me!
            </Typography>
            <Box className='link-box'>https://www.teach-me.com</Box>
            <Box className='link-box'>hello@teach-me.com</Box>
            <Box className='link-box'>support@teach-me.com</Box>
          </Box>
          <Box component='section' className='links-section'>
            <Box component='section'>
              <Typography component='h6'>Header 1</Typography>
              <Box className='links-group'>
                <Box className='link-box'>Link 1</Box>
                <Box className='link-box'>Link 2</Box>
                <Box className='link-box'>Link 3</Box>
                <Box className='link-box'>Link 4</Box>
              </Box>
            </Box>
            <Box component='section'>
              <Typography component='h6'>Header 2</Typography>
              <Box className='links-group'>
                <Box className='link-box'>Link 1</Box>
                <Box className='link-box'>Link 2</Box>
                <Box className='link-box'>Link 3</Box>
                <Box className='link-box'>Link 4</Box>
                <Box className='link-box'>Link 4</Box>
              </Box>
            </Box>
            <Box component='section'>
              <Typography component='h6'>Header 3</Typography>
              <Box className='links-group'>
                <Box className='link-box'>Link 1</Box>
                <Box className='link-box'>Link 2</Box>
                <Box className='link-box'>Link 3</Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function MinorFooter() {
  return (
    <Box className='minor'>
      <Container>
        <Grid container direction='row' justify='center'>
          <Box component='span'>
            <Typography
              className='logo theme-color-tertiary-darker'
              component='span'>
              Teach Me!
            </Typography>{' '}
            &copy; 2020
          </Box>
          <Box component='span'>Link 1</Box>
          <Box component='span'>Link 2</Box>
          <Box component='span'>Link 3</Box>
          <Box component='span'>Link 4</Box>
          <Box component='span'>Link 5</Box>
          <Box component='span'>Link 6</Box>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer;
