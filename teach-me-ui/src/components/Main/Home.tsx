import React from 'react';

// import Box from '@material-ui/core/Box';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import RightPane from './Home.RightPane';
import MiddlePane from './Home.MiddlePane';
import LeftPane from './Home.LeftPane';

const Home = () => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);

  return (
    <>
      <Container className='Home p-0 fade-in'>
        <Row
          className='container mx-auto justify-content-around'
          style={{ alignItems: 'flex-start' }}>
          <Col
            lg={3}
            md={4}
            className='d-none hang-in d-md-block left-pane-col'>
            <LeftPane />
          </Col>
          <Col lg={6} md={8} className='middle-pane-col'>
            <MiddlePane />
          </Col>
          <Col lg={3} className='d-none hang-in d-lg-block right-pane-col'>
            <RightPane />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;