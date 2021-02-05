import React from 'react';
import Skeleton from 'react-loading-skeleton';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Box from '@material-ui/core/Box';

import { InfoCardProps } from '../../types';

export function InfoCard(props: InfoCardProps) {
  const {
    title,
    icon: Icon,
    data,
    hr,
    bgColor,
    boxShadow,
    padding,
    type,
    borderRadius,
    className,
    children
  } = props;

  return (
    <Box
      component='section'
      className={`InfoCard text-left ${className}`}
      style={{
        boxShadow: boxShadow,
        borderRadius: borderRadius,
        padding: padding ?? '1rem',
        backgroundColor: bgColor ?? 'white'
      }}>
      <Col className='info p-0 d-flex my-1'>
        <Col className='py-0 px-2 d-flex justify-content-between align-items-center'>
          <Box component='h2' className='card-title mr-auto'>
            {title}
          </Box>
          {Icon}
        </Col>
      </Col>

      {hr === undefined ? <hr /> : hr && <hr />}

      <Box className='academic-info-section-wrapper'>
        <Row className='academic-info-wrapper d-block mx-0'>
          {data?.map(({ name, value }: { name: string; value: string }) => (
            <Content name={name} value={value} key={name} type={type} />
          ))}
          {children}
        </Row>
      </Box>
    </Box>
  );
}

export function Content({
  name,
  value,
  type
}: {
  name: string;
  value: any;
  type: InfoCardProps['type'];
}) {
  switch (type) {
    case 'colleague':
      return (
        <>
          Colleague name
          <br />
          <br />
        </>
      );
    default:
      return (
        <Col className='info w-auto d-inline-block p-0 mt-2 fade-in-opacity'>
          <Col as='span' className='py-0 pl-2 pr-4 mr-1 w-auto d-inline-block'>
            <Box component='span' className='info-name'>
              {name}:
            </Box>
            <Box component='span' className='info-value'>
              {value ? value : <Skeleton />}
            </Box>
          </Col>
        </Col>
      );
  }
}

export default { InfoCard };
