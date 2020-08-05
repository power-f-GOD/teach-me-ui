import React from 'react';

import Col from 'react-bootstrap/Col';

import MiddlePane from '../Main/Home.MiddlePane';

export default (props: any) => {
  return (
    <Col className='col-8'>
      <MiddlePane type={'WALL'} />
    </Col>
  );
};
