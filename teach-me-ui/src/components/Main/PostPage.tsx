import React from 'react';

// import Box from '@material-ui/core/Box';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ModalFrame from '../crumbs/modals';

const Home = () => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);

  return (
    <>
      <ModalFrame />
      <Container className='Home p-0 fade-in'>
        <Row className='flex-row m-0 justify-content-around'></Row>
      </Container>
    </>
  );
};

export default Home;
