import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';

import Skeleton from 'react-loading-skeleton';

import ReactButton from './ReactButton';
import { bigNumberFormat } from '../../functions/utils';
import { PostPropsState } from '../../constants/interfaces';

const Post: React.FunctionComponent<Partial<PostPropsState>> = (props) => {
  let extra: string | null = null;
  if (props._extra) {
    switch (props._extra.type) {
      case 'UPVOTE':
        extra = `${props._extra?.colleague_name} upvoted this post`;
        break;
      case 'DOWNVOTE':
        extra = `${props._extra?.colleague_name} downvoted this post`;
    }
  }

  return (
    <Box className='post-list-page' borderRadius='5px' p={1} pb={0} mb={1}>
      {props._extra && <small className='small-text'>{extra}</small>}
      <Row className='container-fluid mx-auto p-0 align-items-center'>
        <Avatar
          component='span'
          className='chat-avatar'
          alt={props.sender_name}
          src={`/images/${props.userAvatar}`}
        />
        <Col className='d-flex flex-column bio-post'>
          {props.sender_name ? (
            <>
              <Box component='div' fontWeight='bold'>
                {props.sender_name}
              </Box>
              <Box component='div' color='#777'>
                @{props.sender_username}
              </Box>
            </>
          ) : (
            <>
              <Skeleton width={150} />
              <Skeleton width={100} />
            </>
          )}
        </Col>
        <Col className='more-post-btn'>
          <Box className='more' component='span' borderRadius='100px'>
            <svg
              width='20'
              height='6'
              viewBox='0 0 20 6'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M3 5C1.89543 5 1 4.10457 1 3C1 1.89543 1.89543 1 3 1C4.10457 1 5 1.89543 5 3C5 4.10457 4.10457 5 3 5ZM10 5C8.89543 5 8 4.10457 8 3C8 1.89543 8.89543 1 10 1C11.1046 1 12 1.89543 12 3C12 4.10457 11.1046 5 10 5ZM17 5C15.8954 5 15 4.10457 15 3C15 1.89543 15.8954 1 17 1C18.1046 1 19 1.89543 19 3C19 4.10457 18.1046 5 17 5Z'
                stroke='#666666'
                strokeWidth='1.5'
              />
            </svg>
          </Box>
        </Col>
      </Row>
      {props.text ? (
        <Row className='container-fluid  mx-auto'>
          <Box component='div' pt={1} px={0} className='break-word'>
            {props.text}
          </Box>
        </Row>
      ) : (
        <Box p={2} pl={3}>
          <Skeleton count={3} />
        </Box>
      )}
      {props.sec_type === 'REPOST' && (
        <Box className='quoted-post'>
          <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
            <Avatar
              component='span'
              className='chat-avatar'
              alt={props.sender_name}
              src={`/images/${props.userAvatar}`}
            />
            <Col className='d-flex flex-grow-1 flex-column'>
              <Box component='div' fontWeight='bold'>
                {props.parent?.sender_name}
              </Box>
              <Box component='div' color='#777'>
                @{props.parent?.sender_username}
              </Box>
            </Col>
          </Row>
          <Row className='container-fluid  mx-auto'>
            <Box component='div' pt={1} px={0} className='break-word'>
              {props.parent?.text}
            </Box>
          </Row>
        </Box>
      )}
      {props.sender_name && (
        <Box py={1} mt={1} borderTop='1px solid #ddd'>
          <Row>
            <Col className='d-flex align-items-center justify-content-center'>
              <ReactButton
                id={props.id as string}
                reacted={props.reaction as 'neutral'}
                reactions={props.upvotes as 0}
                type='upvote'
              />
            </Col>
            <Col className='d-flex align-items-center justify-content-center'>
              <ReactButton
                id={props.id as string}
                reacted={props.reaction as 'neutral'}
                reactions={props.downvotes as 0}
                type='downvote'
              />
            </Col>
            <Col className='d-flex align-items-center justify-content-center'>
              <Box className='post-details' fontSize='13px'>
                {bigNumberFormat(props.replies)} Comments
              </Box>
            </Col>
          </Row>
        </Box>
      )}
    </Box>
  );
};

export default Post;
