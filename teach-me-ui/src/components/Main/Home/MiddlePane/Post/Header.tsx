import React from 'react';
import { Link } from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

import Skeleton from 'react-loading-skeleton';

import { formatDate } from '../../../../../utils';
import { KAvatar } from '../../../../shared';

interface PostHeaderProps {
  isLoading: boolean;
  sender_name?: string;
  sender_username?: string;
  posted_at?: number;
  profile_photo?: string;
}

const PostHeader = (props: PostHeaderProps) => {
  const {
    isLoading,
    sender_name,
    sender_username,
    posted_at,
    profile_photo
  } = props;

  return (
    <Row className='post-header'>
      <KAvatar
        className='post-avatar align-self-center mr-1'
        alt={sender_name}
        src={profile_photo ? profile_photo : ''}
      />
      <Col className='d-flex flex-column justify-content-center pl-2'>
        {!isLoading ? (
          <>
            <Box>
              <Link to={`/@${sender_username}`} className='font-bold'>
                {sender_name}
              </Link>
              <Box component='span' className='theme-tertiary-darker ml-1'>
                | @{sender_username}
              </Box>
            </Box>
            <Box component='small' className='theme-tertiary-darker'>
              {formatDate(+posted_at!)}
            </Box>
          </>
        ) : (
          <>
            <Box className='d-flex'>
              <Skeleton width={150} />
              <Box className='ml-2'>
                <Skeleton width={100} />
              </Box>
            </Box>
            <Box component='small'>
              <Skeleton width={100} />
            </Box>
          </>
        )}
      </Col>
    </Row>
  );
};

export default PostHeader;
