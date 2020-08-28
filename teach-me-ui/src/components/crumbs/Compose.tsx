import React from 'react';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';

import { displayModal } from '../../functions';

let userInfo: any = {};
let [avatar, displayName] = ['', ''];

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
}

const openCreatePostModal = (e: any) => {
  displayModal(true, 'CREATE_POST', { title: 'Create Post' });
};

const Compose: React.FunctionComponent = () => {
  return (
    <Box
      className='post-list-page d-flex flex-column mb-1 mb-md-2'
      borderRadius='5px'
      p={1}>
      <Box display='flex'>
        <Avatar
          component='span'
          className='chat-avatar compose-avatar'
          alt={displayName}
          src={`/images/${avatar}`}
        />
        <Box
          className='compose-question flex-grow-1'
          py={1}
          fontSize='16px'
          color='#888'
          onClick={openCreatePostModal}
          role='compose'
          px={2}>
          What's on your mind {displayName.split(' ')[0]}?
        </Box>
      </Box>
    </Box>
  );
};

export default Compose;