import React from 'react';

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Box from '@material-ui/core/Box';

export interface InfoCardProps {
  icon: Element | JSX.Element | null;
  title: string;
  data: { name: string; value: any }[];
  type?: 'info' | 'colleague';
  bgcolor?: string;
  boxShadow?: string;
  padding?: string;
  borderRadius?: string;
  className?: string;
}

export function InfoCard(props: InfoCardProps) {
  const {
    title,
    icon: Icon,
    data,
    bgcolor,
    boxShadow,
    padding,
    type,
    borderRadius,
    className
  } = props;

  return (
    <Box
      component='section'
      className={`InfoCard text-left ${className}`}
      bgcolor={bgcolor ? bgcolor : 'white'}
      boxShadow={boxShadow ? boxShadow : '0 0 2.5rem rgba(0, 0, 0, 0.2)'}
      padding={padding ? padding : '1rem'}
      borderRadius={borderRadius ? borderRadius : '1.25rem'}>
      <Col className='info p-0 d-flex my-1'>
        <Col className='py-0 px-2 d-flex justify-content-between align-items-center'>
          <Box component='h2' className='card-title mr-auto'>
            {title}
          </Box>
          {Icon}
        </Col>
      </Col>

      <hr />

      <Box className='academic-info-section-wrapper'>
        <Row className='academic-info-wrapper mx-0'>
          {data.map(({ name, value }: { name: string; value: string }) => (
            <Content name={name} value={value} key={name} type={type} />
          ))}
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
      return <>Colleague name<br /><br /></>;
    default:
      return (
        <Col
          xs={/email|institution|department/i.test(name) ? 12 : 6}
          className='info p-0 d-flex mt-2 fade-in'>
          <Col
            as='span'
            className='py-0 d-flex flex-column align-items-start px-2'>
            <Box component='span' className='info-name'>
              {name}:
            </Box>
            <Box component='span' className='info-value'>
              {value}
            </Box>
          </Col>
        </Col>
      );
  }
}

export default { InfoCard };
