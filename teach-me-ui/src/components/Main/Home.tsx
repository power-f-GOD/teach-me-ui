import React from 'react';

// import Box from '@material-ui/core/Box';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import RightPane from './RightPane';
import MiddlePane from './MiddlePane';
import LeftPane from './LeftPane';

const Home = () => {
  return (
    <Container fluid className='Home p-0 fade-in'>
      <Row className='flex-row w-100 m-0 justify-content-around'>
        <Col lg={3} className='left-pane-col'>
          <LeftPane />
        </Col>
        <Col lg={6} className='middle-pane-col'>
          <MiddlePane />
        </Col>
        <Col lg={3} className='right-pane-col'>
          <RightPane />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
