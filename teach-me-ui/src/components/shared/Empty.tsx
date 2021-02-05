import React from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import { InfoCard, FAIcon } from '.';

const Empty = (props: {
  headerText?: string;
  riderText?: string;
  iconName?: string;
  imageWidth?: string | number;
  action?: {
    text?: string;
    iconName?: string;
    func: Function;
  };
}) => {
  const { headerText, riderText, iconName, imageWidth, action } = props;

  return (
    <InfoCard
      title={headerText || 'Empty'}
      icon={<FAIcon name={iconName || 'box-open'} fontSize='1.5em' />}
      type='colleague'
      bgColor='#fff'
      hr={false}
      padding='0.75rem'
      className='Empty Post mx-0 w-100 fade-in mb-2 header'>
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
        {action && (
          <Button
            variant='contained'
            size='small'
            className='btn-tertiary text px-2 my-2 px-md-3 py-1'
            color='default'
            onClick={() => {
              if (action?.func) action.func();
            }}>
            <FAIcon
              name={action?.iconName ?? 'sync-alt'}
              className='mr-2'
              fontSize='1.15em'
            />
            {action?.text ?? 'Refresh Feeds'}
          </Button>
        )}
      </Box>
    </InfoCard>
  );
};

export default React.memo(Empty);
