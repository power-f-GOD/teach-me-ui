import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

import { formatDate, processText } from '../../../../../utils';
import { PostStateProps } from '../../../../../types';
import Media from '../../../../shared/Media';
import { KAvatar } from '../../../../shared';

const QuotedPost = (
  props: Partial<PostStateProps> & {
    navigate: Function;
  }
) => {
  const { id, sender, date: posted_at, text, media, navigate } = props || {};
  const { first_name, last_name, profile_photo, username } = sender || {};
  const sender_name = `${first_name} ${last_name}`;

  return (
    <Box
      className='QuotedPost'
      data-id={id}
      onClick={!props.head ? navigate(id as string) : undefined}>
      <Row className='mx-0 align-items-center my-2 px-2'>
        <KAvatar
          className='post-avatar'
          alt={sender_name}
          src={profile_photo ? profile_photo : ''}
        />
        <Col className='header d-flex flex-column justify-content-center pl-2'>
          <Box>
            {props.head ? (
              <Box component='span' className='post-sender font-bold'>
                {sender_name}
              </Box>
            ) : (
              <Col as='span' className='post-sender font-bold'>
                {sender_name}
              </Col>
            )}
            <Col as='span' className='theme-tertiary-darker ml-1 px-0'>
              | @{username}
            </Col>
          </Box>
          <Box component='small' className='theme-tertiary-darker'>
            {formatDate(posted_at!)}
          </Box>
        </Col>
      </Row>

      <Row className='mt-2 post-text mx-0'>
        {text && (
          <Box component='div' className='px-2 pb-2'>
            {processText(text as string)}
          </Box>
        )}
        <Media media={media} />
      </Row>
    </Box>
  );
};

export default QuotedPost;
