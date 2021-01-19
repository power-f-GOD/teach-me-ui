import React from 'react';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';

import { displayModal } from '../../../../functions';
import { MAKE_POST } from '../../../../constants';
import { UserData } from '../../../../types';

const openCreatePostModal = (e: any) => {
  displayModal(true, false, MAKE_POST, { title: 'Make a Post' });
};

export const Compose: React.FunctionComponent<{
  userData: Partial<UserData>;
}> = ({ userData }) => {
  const { first_name, profile_photo } = userData;

  return (
    <Box className='Compose d-flex flex-column'>
      <Box display='flex'>
        <Box pr={1} className='d-flex align-items-center'>
          <Avatar
            component='span'
            className='chat-avatar compose-avatar'
            alt={first_name}
            src={profile_photo || ''}
          />
        </Box>
        <Box
          className='compose-question theme-tertiary-lighter'
          onClick={openCreatePostModal}
          role='compose'>
          {first_name}, have any educative thought?
        </Box>
      </Box>
    </Box>
  );
};

export default Compose;
