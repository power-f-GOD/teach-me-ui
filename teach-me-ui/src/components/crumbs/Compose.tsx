import React from 'react';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';

import { displayModal } from '../../functions';
import { connect } from 'react-redux';

const openCreatePostModal = (e: any) => {
  displayModal(true, false, 'CREATE_POST', { title: 'Create Post' });
};

export const Compose: React.FunctionComponent = (props: any) => {
  const { firstname, profile_photo } = props.userData;
  return (
    <Box className='Compose d-flex flex-column'>
      <Box display='flex'>
        <Box pr={1}>
          <Avatar
            component='span'
            className='chat-avatar compose-avatar'
            alt={firstname}
            src={profile_photo}
          />
        </Box>
        <Box
          className='compose-question theme-tertiary-lighter'
          onClick={openCreatePostModal}
          role='compose'>
          {firstname}, have any educative thought?
        </Box>
      </Box>
    </Box>
  );
};

export default connect(({ userData }: any) => ({ userData }))(Compose);
