import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import MiddlePane from './QuestionPage.MiddlePane';
import RightPane from './Home.RightPane';

const Questions = (props: any) => {
  return (
    <>
      <Container className='Home fade-in'>
        <Row className='flex-row m-2 justify-content-between'>
          <Col lg={9} md={12} className='middle-pane-col pr-2'>
            <MiddlePane />
          </Col>
          <Col lg={3} className='d-none d-lg-block right-pane-col mt-1'>
            <RightPane />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Questions;