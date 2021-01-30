import React from 'react';
import Skeleton from 'react-loading-skeleton';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';

import { SELECT_PHOTO } from '../../../constants';
import { UserData } from '../../../types';
import { displayModal, formatMapDateString } from '../../../functions';
import { FAIcon, Img } from '../../shared';

const ProfileHeader = (props: {
  data: UserData;
  isSelfView: boolean;
  windowWidth: number;
}) => {
  const { data, isSelfView, windowWidth } = props;
  const {
    displayName,
    profile_photo,
    cover_photo,
    date_joined,
    bio,
    username
  } = data;

  const openProfilePhotoEditModal = () => {
    displayModal(true, false, SELECT_PHOTO, { title: 'Select Profile Photo' });
  };

  const openCoverPhotoEditModal = (e: any) => {
    displayModal(true, false, SELECT_PHOTO, { title: 'Select Cover Photo' });
  };

  return (
    <Container as='header' fluid className='header px-0'>
      <Container fluid className='cover-photo-container px-0'>
        <Img
          alt={displayName}
          className={`cover-photo ${
            displayName && cover_photo ? 'fade-in-opacity' : ''
          }`}
          src={
            cover_photo ||
            'https://www.thoughtco.com/thmb/mik7Z00SAYN786BQbieXWOzZmc8=/2121x1414/filters:fill(auto,1)/lotus-flower-828457262-5c6334b646e0fb0001dcd75a.jpg'
          }
        />
      </Container>

      <Container className='details-container'>
        <Box className='avatar-with-icon px-0 mx-0'>
          <Avatar
            component='span'
            className='profile-avatar profile-photo'
            alt={displayName}
            src={profile_photo}
          />
          {isSelfView && (
            <Tooltip title='Edit profile photo'>
              <IconButton
                onClick={openProfilePhotoEditModal}
                className='change-avatar-button'>
                <FAIcon name='camera' />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Col className='px-2 px-sm-4 pt-1'>
          <Col as='h1' className='display-name p-0 my-0 d-inline-flex'>
            {displayName || (
              <>
                <Skeleton className='on-dark' width={160} />
                <Skeleton className='on-dark ml-3' width={140} />
              </>
            )}
          </Col>
          <Col as='span' className='username d-block p-0 mb-2'>
            @{username || <Skeleton className='on-dark ml-1' width={130} />}
          </Col>
          <Col as='span' className='bio text-ellipsis p-0 mt-1'>
            <FAIcon name='pen' />{' '}
            {bio || <Skeleton className='on-dark' width={340} />}
          </Col>
          <Col as='span' className='date-joined p-0 d-block capitalize my-1'>
            <FAIcon name='calendar-day' /> Joined{' '}
            {date_joined ? (
              formatMapDateString(date_joined, false, true, ',')
            ) : (
              <Skeleton className='on-dark' width={160} />
            )}
          </Col>
        </Col>
      </Container>

      {isSelfView && (
        <Tooltip title={windowWidth < 768 ? 'Edit cover photo' : ''}>
          <Button
            variant='contained'
            size='small'
            className='change-cover-photo-button fade-in btn-tertiary text px-2 px-md-3 py-1'
            color='default'
            onClick={openCoverPhotoEditModal}>
            <FAIcon name='image' className='mr-1 mr-sm-2' fontSize='1.75em' />
            {windowWidth > 767 ? (
              'Edit Cover Photo'
            ) : (
              <FAIcon name='pen' fontSize='1em' />
            )}
          </Button>
        </Tooltip>
      )}
    </Container>
  );
};

export default ProfileHeader;
