import React from 'react';

// import Box from '@material-ui/core/Box';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import RightPane from './RightPane';
import MiddlePane from './MiddlePane';
import LeftPane from './LeftPane';
import ModalFrame from '../crumbs/modals';

const Home = () => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);

  return (
    <>
      <ModalFrame />
      <Container className='Home p-0 fade-in'>
        <Row className='flex-row m-0 justify-content-around'>
          <Col lg={3} md={3} className='d-none d-md-block left-pane-col'>
            <LeftPane />
          </Col>
          <Col lg={6} md={9} className='middle-pane-col'>
            <MiddlePane />
          </Col>
          <Col lg={3} className='d-none d-lg-block right-pane-col'>
            <RightPane />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
