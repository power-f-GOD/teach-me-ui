import React from 'react';
import { Link } from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import { Avatar } from '@material-ui/core';

import { processPost } from '.';
import { formatDate } from '../../../../../functions/utils';
import { PostStateProps } from '../../../../../types';

const QuotedPost = (
  props: Partial<PostStateProps> & { navigate: Function }
) => {
  const { id, sender, date: posted_at, text, navigate } = props || {};
  const { first_name, last_name, profile_photo, username } = sender || {};
  const sender_name = `${first_name} ${last_name}`;

  return (
    <Box className='QuotedPost' data-id={id} onClick={()=> {!props.head && navigate(id as string)()}}>
      <Row className='mx-0 align-items-center'>
        <Avatar
          component='span'
          className='post-avatar'
          alt={sender_name}
          src={profile_photo ? profile_photo : ''}
        />
        <Col className='d-flex flex-column justify-content-center pl-2'>
          <Box className='d-flex'>
            {props.head ? (
              <Box component='span' className='post-sender font-bold'>
                {sender_name}
              </Box>
            ) : (
              <Link to={`@${username}`} className='post-sender font-bold'>
                {sender_name}
              </Link>
            )}
            <Box className='theme-tertiary-lighter ml-1'>| @{username}</Box>
          </Box>
          <Box component='small' className='theme-tertiary'>
            {formatDate(posted_at!)}
          </Box>
        </Col>
      </Row>

      <Row className='container-fluid  mx-auto'>
        <Box component='div' pt={1} px={0} className='break-word'>
          {processPost(text as string)}
        </Box>
      </Row>
    </Box>
  );
};

export default QuotedPost;
