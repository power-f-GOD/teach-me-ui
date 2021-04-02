import React from 'react';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

import Col from 'react-bootstrap/Col';

import Badge from '@material-ui/core/Badge';

import { FAIcon, KAvatar } from './';
import { UserData } from '../../types';

const User = (props: Partial<UserData> & { linkify?: boolean }) => {
  const {
    first_name,
    last_name,
    online_status,
    linkify,
    profile_photo,
    username,
    department
  } = props;
  const displayName = first_name ? `${first_name} ${last_name}` : '';
  const jsx = (
    <Col className='sub-container mr-1 d-flex align-items-center mx-0'>
      <Badge
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        className={online_status?.toLowerCase() ?? 'offline'}
        overlap='circle'
        variant='dot'>
        <KAvatar
          className='profile-photo'
          alt={displayName}
          src={profile_photo}
        />
      </Badge>

      <Col className='pr-0 pl-3 pl-sm-2 pl-md-3'>
        <Col className='display-name font-bold px-0'>
          {displayName || <Skeleton width='100%' />}
        </Col>
        <Col className='username theme-tertiary-darker px-0'>
          @{username || <Skeleton width='50%' />}
        </Col>
        <Col className='department theme-tertiary px-0'>
          <FAIcon name='book' className='mr-1' />
          {department || <Skeleton width='80%' />}
        </Col>
      </Col>
    </Col>
  );

  return (
    <Col
      xs={12}
      sm={6}
      md={12}
      className='User d-flex px-2 px-sm-1 mb-1 mb-sm-2 mb-md-1'>
      {linkify ? (
        <Link to={`/@${username}`} className='d-flex no-select'>
          {jsx}
        </Link>
      ) : (
        jsx
      )}
    </Col>
  );
};

export default User;
