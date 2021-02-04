import React, { createRef } from 'react';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import { InfoCard } from '../../shared/Card';
import { FAIcon } from '../../shared/Icons';

export const navBarObserveeRef = createRef<HTMLElement | null>();

const ProfileRightPane = () => {
  return (
    <Col
      xs={12}
      md={5}
      className='hang-in-md no-hang-in order-0 order-sm-0 order-md-1 mb-1 px-0 px-sm-3'>
      <Container className='nav-bar-observee' ref={navBarObserveeRef as any} />
      <InfoCard
        title='Colleagues'
        icon={<FAIcon name='user-friends' fontSize='1.5em' />}
        type='colleague'
        bgColor='#fff'
        boxShadow='none'
        padding='1rem 0.75rem 0.75rem'
        className='mb-2'
      />
    </Col>
  );
};

export default ProfileRightPane;
