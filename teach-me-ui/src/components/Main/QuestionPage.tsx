import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import MiddlePane from './QuestionPage.MiddlePane';
import HomeRightPane from './Home/RightPane';

const Questions = (props: any) => {
  return (
    <>
      <Container className='Home fade-in'>
        <Row className='mx-auto justify-content-around align-items-start pt-1'>
          <Col lg={9} md={12} className='middle-pane-col px-3'>
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