import React from 'react';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';

import { displayModal } from '../../functions';
import { connect } from 'react-redux';
import { userDeviceIsMobile } from '../..';
import { CREATE_POST } from '../../constants/modals';

const openCreatePostModal = (e: any) => {
  displayModal(true, false, CREATE_POST, { title: 'Create Post' });
};

export const Compose: React.FunctionComponent = (props: any) => {
  const { firstname, profile_photo } = props.userData;
  return (
    <Box
      className='post-list-page d-flex flex-column mb-1 mb-md-2'
      borderRadius='5px'
      p={1}>
      <Box display='flex'>
        <Box px={1}>
          <Avatar
            component='span'
            className='chat-avatar compose-avatar'
            alt={firstname}
            src={profile_photo}
          />
        </Box>
        <Box
          className='compose-question flex-grow-1 d-flex align-items-center'
          py={1}
          fontSize='16px'
          color='#888'
          onClick={openCreatePostModal}
          role='compose'
          px={2}>
          What's on your mind{userDeviceIsMobile ? '' : ` ${firstname}`}?
        </Box>
      </Box>
    </Box>
  );
};

export default connect(({ userData }: any) => ({ userData }))(Compose);
