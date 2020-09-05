import React from 'react';
import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

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
        <Row className='justify-content-evenly px-2'>
          <Col as='section' xs={12} sm={6}>
            <Box component='span'>
              <Box className='logo grey'>Kanyimuta!</Box> &copy; 2020
            </Box>
            <Box marginBottom='2.5rem' className='web-address'>
              <Link to='/'>https://www.kanyimuta.com</Link>
            </Box>
          </Col>
          <Col as='section' xs={12} sm={6}>
            <Row className='flex-column mx-0'>
              <Col className='p-0'>
                <Box fontWeight='bold' marginBottom='0.5rem'>
                  Navigation
                </Box>
              </Col>
              <Row className='flex-column'>
                <Col>
                  <Link to='/'>Home</Link>
                </Col>
                <Col>
                  <Link to='/about'>About</Link>
                </Col>
                <Col>
                  <Link to='/support'>Support</Link>
                </Col>
              </Row>
            </Row>
          </Col>
        </Row>
      </Container>
    </Box>
  );
}

export default Footer;
