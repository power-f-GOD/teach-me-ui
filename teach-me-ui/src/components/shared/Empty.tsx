import React from 'react';

import Box from '@material-ui/core/Box';

import { InfoCard, FAIcon } from '.';

const Empty = (props: {
  headerText?: string;
  riderText?: string;
  iconName?: string;
  imageWidth?: string | number;
}) => {
  const { headerText, riderText, iconName, imageWidth } = props;

  return (
    <InfoCard
      title={headerText || 'Empty'}
      icon={<FAIcon name={iconName || 'box-open'} fontSize='1.5em' />}
      type='colleague'
      bgColor='#fff'
      hr={false}
      padding='0.75rem'
      className='Empty Post fade-in mb-2 header'>
      <Box className='text-center font-bold'>
        <img
          alt='no data'
          className='mx-auto py-5'
          width={imageWidth ?? '75%'}
          src='/images/no_data.svg'
        />
        <Box fontSize='1.15em' className='mb-2'>
          {riderText || "It's empty!"}
        </Box>
      </Box>
    </InfoCard>
  );
};

export default Empty;
