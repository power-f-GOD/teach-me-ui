import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import MiddlePane from './MiddlePane';
import HomeRightPane from '../Home/RightPane';
import HomeLeftPane from '../Home/LeftPane';

const Questions = (props: any) => {
  return (
    <>
      <Container className='Home fade-in'>
        <Row
          className='mx-auto justify-content-around align-items-start py-3'>
          <Col
            lg={3}
            md={4}
            className='d-none hang-in d-md-block left-pane-col'>
            <HomeLeftPane />
          </Col>
          <Col lg={6} md={8} className='middle-pane-col px-3'>
            <MiddlePane />
          </Col>
          <Col lg={3} className='d-none hang-in d-lg-block right-pane-col'>
            <HomeRightPane />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Questions;