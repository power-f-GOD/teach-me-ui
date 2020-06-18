import React from 'react';

import Row from 'react-bootstrap/Row';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';

import { displayModal } from '../../functions';

let userInfo: any = {};
let [avatar, displayName] = ['', ''];

if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
}

const openCreatePostModal = (e: any) => {
  displayModal(true, 'CREATE_POST');
};

const Compose: React.FunctionComponent = (props) => {
  return (
    <Box
      className='post-list-page d-flex flex-column'
      borderRadius='5px'
      p={1}
      mb={1}>
      <Row className='container-fluid mx-auto align-items-center'>
        <Avatar
          component='span'
          className='chat-avatar compose-avatar'
          alt={displayName}
          src={`/images/${avatar}`}
        />
        <Box component='div' fontSize='14px' fontWeight='bold' color='#555'>
          {displayName}
        </Box>
      </Row>
      <Row className='container-fluid mx-auto align-items-center'>
        <Box
          className='compose-question'
          py={1}
          width='100%'
          fontSize='19px'
          color='#888'
          onClick={openCreatePostModal}
          px={2}>
          What's on your mind?
        </Box>
      </Row>
    </Box>
  );
};

export default Compose;
