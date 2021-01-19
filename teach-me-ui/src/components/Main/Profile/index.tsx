import React, { useState, useEffect, createRef } from 'react';

import { Redirect, Link, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import AddColleagueIcon from '@material-ui/icons/PersonAdd';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import PendingIcon from '@material-ui/icons/RemoveCircle';
import RejectIcon from '@material-ui/icons/Close';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import Button from '@material-ui/core/Button';

import Img from '../../shared/Img';
import ColleagueView from './crumbs/ColleagueView';
import ProfileFeeds from './crumbs/ProfileFeeds';
import { EDIT_PROFILE, SELECT_PHOTO } from '../../../constants';
import { UserData, DeepProfileProps } from '../../../types';
import { dispatch, cleanUp, displayModal } from '../../../functions';
import { getProfileData } from '../../../actions';
import { getConversations } from '../../../actions/main/chat';
import * as api from '../../../actions/profile';
import { InfoCard } from '../../shared/Card';
import { FAIcon } from '../../shared/Icons';
// import Loader from '../crumbs/Loader';
/**
 * Please, Do not delete any commented code; You can either uncomment them to use them or leave them as they are
 */

interface InfoProps {
  name: string;
  value: string;
}

export const refs: any = {
  firstnameInput: createRef<HTMLInputElement>(),
  lastnameInput: createRef<HTMLInputElement>(),
  usernameInput: createRef<HTMLInputElement>(),
  emailInput: createRef<HTMLInputElement>(),
  dobInput: createRef<HTMLInputElement>(),
  // passwordInput: createRef<HTMLInputElement>(),
  institutionInput: createRef<HTMLInputElement>(),
  departmentInput: createRef<HTMLInputElement>(),
  levelInput: createRef<HTMLInputElement>()
};

window.addEventListener('popstate', () => {
  cleanUp(false);
});

let [
  firstname,
  lastname,
  displayName,
  username,
  email,
  // dob,
  institution,
  department,
  level,
  bio
] = Array(11).fill('');

let basicInfo: InfoProps[];
let academicInfo: InfoProps[];

const Profile = (props: any) => {
  const {
    profileData,
    userData,
    deepProfileData,
    addColleagueStatus,
    fetchDeepProfileStatus,
    removeColleagueStatus,
    acceptColleagueStatus,
    declineColleagueStatus,
    unColleagueStatus
  } = props;
  const data: UserData = profileData.data[0];
  const { auth } = props;
  const { isAuthenticated } = auth;
  firstname = data.first_name || '';
  lastname = data.last_name || '';
  displayName = data.displayName || '';
  email = data.email || '';
  email = email + '';
  // dob = data.date_of_birth?.split('-').reverse().join('-') || '';
  institution = data.institution || '';
  department = data.department || '';
  level = data.level || '';
  bio = data.bio || 'Hey there, I use Kanyimuta';

  //username of currently authenticated user which will be used to check if the current profile data requested is for another user or currently authenticated user in order to render the views accordingly
  username = '@' + (userData.username || '');

  let { userId } = props.match.params;
  const isId = /^@\w+$/.test('@' + userId);
  userId = isId ? '@' + userId.toLowerCase() : username;
  // here is where the check is made to render the views accordingly
  const isSelf = userId === username;
  let selfView = isAuthenticated ? isSelf : false;

  useEffect(() => {
    if (data.id && !selfView) {
      dispatch(api.fetchDeepProfile(data.id));
    }
    // eslint-disable-next-line
  }, [data.id, selfView, username]);

  const [acceptWasClicked, setAcceptWasClicked] = useState(false);
  const [declineWasClicked, setDeclineWasClicked] = useState(false);
  const [colleagueButtonWasClicked, setColleagueButtonWasClicked] = useState(
    false
  );
  const onColleagueActionClick = async (e: any, decline?: boolean) => {
    setColleagueButtonWasClicked(true);
    const deepData = deepProfileData as DeepProfileProps;
    switch (deepData.status) {
      case 'NOT_COLLEAGUES':
        await dispatch(api.addColleague(data.id, data.username));
        break;
      case 'PENDING_REQUEST':
        await dispatch(
          api.removeColleague(deepData.request_id as string, data.id)
        );
        break;
      case 'AWAITING_REQUEST_ACTION':
        if (decline) {
          setAcceptWasClicked(false);
          setDeclineWasClicked(true);
        } else {
          setAcceptWasClicked(true);
          setDeclineWasClicked(false);
        }
        !decline
          ? await dispatch(
              api.acceptColleague(
                deepData.request_id as string,
                data.username,
                data.id
              )
            )
          : await dispatch(
              api.declineColleague(deepData.request_id as string, data.id)
            );
        break;
      case 'IS_COLLEAGUE':
        await dispatch(api.unColleague(data.id));
        break;
    }
    dispatch(getConversations('settled')(dispatch));
  };

  basicInfo = [
    { name: 'Firstname', value: selfView ? userData.first_name : firstname },
    { name: 'Lastname', value: selfView ? userData.last_name : lastname },
    { name: 'Username', value: selfView ? userData.username : userId }
    // { name: 'Bio', value: selfView ? userData.bio ? userData.bio : 'Hey there, I use Kanyimuta' : bio },
    // { name: 'Date of birth', value: selfView ? userData.dob : dob },
    // { name: 'Email', value: selfView ? userData.email : email }
  ];
  academicInfo = [
    {
      name: 'Institution',
      value: selfView ? userData.institution : institution
    },
    { name: 'Department', value: selfView ? userData.department : department },
    { name: 'Level', value: selfView ? userData.level : level }
  ];

  const openEditProfileModal = () => {
    displayModal(true, false, EDIT_PROFILE, { title: 'Edit Profile' });
  };

  const handleEditClick = () => {
    openEditProfileModal();
  };

  useEffect(() => {
    if (!selfView) {
      return () => {
        window.scrollTo(0, 0);
      };
    }
  }, [selfView]);

  useEffect(() => {
    cleanUp(true);
    dispatch(getProfileData(userId.replace('@', ''))(dispatch));

    return () => {
      cleanUp(true);
    };
  }, [userId, profileData.username]);

  if (!isId) {
    return <Redirect to={`/${username}`} />;
  } else if (profileData.err || !profileData.data[0]) {
    return <Redirect to='/404' />;
  }

  // if (
  //   !/chat=o1/.test(window.location.search) && false &&
  //   profileData.status !== 'fulfilled'
  // ) {
  //   //instead of this, you can use a React Skeleton loader; didn't have the time to add, so I deferred.
  //   return <Loader />;
  // }

  const openProfilePhotoEditModal = () => {
    displayModal(true, false, SELECT_PHOTO, { title: 'Select Profile Photo' });
  };

  const openCoverPhotoEditModal = (e: any) => {
    displayModal(true, false, SELECT_PHOTO, { title: 'Select Cover Photo' });
  };

  return (
    <Box className={`Profile ${selfView ? 'self-view' : ''} fade-in pb-3`}>
      <Box component='div' className='profile-top'>
        <Img
          alt={displayName}
          className='cover-photo'
          src={selfView ? userData.cover_photo : data.cover_photo}
        />
        <Container className='details-container'>
          <div className='avatar-with-icon'>
            <Avatar
              component='span'
              className='profile-avatar-x profile-photo'
              alt={displayName}
              src={selfView ? userData.profile_photo : data.profile_photo}
            />
            {selfView && (
              <div
                onClick={openProfilePhotoEditModal}
                className='profile-photo-change-container'>
                <PhotoCameraIcon className='profile-photo-change' />
              </div>
            )}
          </div>

          <Col className='d-flex flex-column px-4 pt-1'>
            <Col as='span' className='display-name p-0 my-1'>
              {selfView ? userData.displayName : displayName}
            </Col>
            <Col as='span' className='username p-0 mb-1'>
              {selfView ? `@${userData.username}` : userId}
            </Col>
            <Col as='span' className='bio p-0'>
              {selfView ? userData.bio : bio}
            </Col>
          </Col>
        </Container>
        <div className='profile-nav-bar d-flex justify-content-center align-items-center'>
          <Link to={`/${userId}`}>
            <div
              className={`nav-item ${
                !/colleagues/.test(props.location.pathname) ? 'active' : ''
              }`}>
              WALL
            </div>
          </Link>
          {selfView && (
            <Link to={`/${userId}/colleagues`}>
              <div
                className={`nav-item colleague-nav ${
                  /colleagues/.test(props.location.pathname) ? 'active' : ''
                }`}>
                COLLEAGUES
              </div>
            </Link>
          )}
          {!selfView &&
            (isAuthenticated && deepProfileData !== null ? (
              <>
                {deepProfileData.status === 'NOT_COLLEAGUES' && (
                  <Button
                    variant='contained'
                    size='small'
                    className='colleague-action-button add-colleague primary'
                    color='primary'
                    disabled={
                      colleagueButtonWasClicked &&
                      (addColleagueStatus.status === 'pending' ||
                        fetchDeepProfileStatus.status === 'pending')
                    }
                    onClick={onColleagueActionClick}>
                    {colleagueButtonWasClicked &&
                    (addColleagueStatus.status === 'pending' ||
                      fetchDeepProfileStatus.status === 'pending') ? (
                      <Box textAlign='center'>
                        <CircularProgress size={28} color='inherit' />
                      </Box>
                    ) : (
                      <>
                        <AddColleagueIcon fontSize='inherit' /> Add Colleague
                      </>
                    )}
                  </Button>
                )}
                {deepProfileData.status === 'PENDING_REQUEST' && (
                  <Button
                    variant='contained'
                    size='small'
                    className='colleague-action-button cancel-request'
                    color='primary'
                    disabled={
                      colleagueButtonWasClicked &&
                      (removeColleagueStatus.status === 'pending' ||
                        fetchDeepProfileStatus.status === 'pending')
                    }
                    onClick={onColleagueActionClick}>
                    {colleagueButtonWasClicked &&
                    (removeColleagueStatus.status === 'pending' ||
                      fetchDeepProfileStatus.status === 'pending') ? (
                      <Box textAlign='center'>
                        <CircularProgress size={28} color='inherit' />
                      </Box>
                    ) : (
                      <>
                        <PendingIcon fontSize='inherit' /> Cancel Request
                      </>
                    )}
                  </Button>
                )}
                {deepProfileData.status === 'AWAITING_REQUEST_ACTION' && (
                  <>
                    <Button
                      variant='contained'
                      size='small'
                      id='accept'
                      className='colleague-action-button accept-request'
                      color='primary'
                      disabled={
                        colleagueButtonWasClicked &&
                        acceptWasClicked &&
                        (acceptColleagueStatus.status === 'pending' ||
                          fetchDeepProfileStatus.status === 'pending')
                      }
                      onClick={onColleagueActionClick}>
                      {colleagueButtonWasClicked &&
                      acceptWasClicked &&
                      (acceptColleagueStatus.status === 'pending' ||
                        fetchDeepProfileStatus.status === 'pending') ? (
                        <Box textAlign='center'>
                          <CircularProgress size={28} color='inherit' />
                        </Box>
                      ) : (
                        <>
                          <AddColleagueIcon fontSize='inherit' /> Accept Request
                        </>
                      )}
                    </Button>
                    <Button
                      variant='contained'
                      size='small'
                      id='decline'
                      className='colleague-action-button decline-request'
                      color='primary'
                      disabled={
                        colleagueButtonWasClicked &&
                        declineWasClicked &&
                        (declineColleagueStatus.status === 'pending' ||
                          fetchDeepProfileStatus.status === 'pending')
                      }
                      onClick={(e: any) => {
                        onColleagueActionClick(e, true);
                      }}>
                      {colleagueButtonWasClicked &&
                      declineWasClicked &&
                      (declineColleagueStatus.status === 'pending' ||
                        fetchDeepProfileStatus.status === 'pending') ? (
                        <Box textAlign='center'>
                          <CircularProgress size={28} color='inherit' />
                        </Box>
                      ) : (
                        <>
                          <RejectIcon fontSize='inherit' />{' '}
                          <span className='colleaguing-text'>Decline</span>
                        </>
                      )}
                    </Button>
                  </>
                )}
                {deepProfileData.status === 'IS_COLLEAGUE' && (
                  <Button
                    variant='contained'
                    size='large'
                    className='colleague-action-button uncolleague'
                    color='primary'
                    disabled={
                      colleagueButtonWasClicked &&
                      (unColleagueStatus.status === 'pending' ||
                        fetchDeepProfileStatus.status === 'pending')
                    }
                    onClick={onColleagueActionClick}>
                    {colleagueButtonWasClicked &&
                    (unColleagueStatus.status === 'pending' ||
                      fetchDeepProfileStatus.status === 'pending') ? (
                      <Box textAlign='center'>
                        <CircularProgress size={28} color='inherit' />
                      </Box>
                    ) : (
                      <>
                        <PendingIcon fontSize='inherit' /> Uncolleague
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : null)}
          {selfView ? (
            <>
              <Button
                variant='contained'
                size='large'
                className='colleague-action-button add-colleague'
                color='primary'
                onClick={handleEditClick}>
                <CreateOutlinedIcon fontSize='inherit' /> Edit Profile
              </Button>
            </>
          ) : (
            ''
          )}
          {false && (
            <Button
              variant='contained'
              size='small'
              className='more-btn'
              color='primary'
              onClick={() => {}}>
              <MoreIcon fontSize='inherit' />
            </Button>
          )}
        </div>
        {selfView && (
          <div className='change-cover'>
            <Button
              variant='contained'
              size='small'
              className='cover-button'
              color='default'
              onClick={openCoverPhotoEditModal}>
              <PhotoCameraIcon
                fontSize='inherit'
                className='profile-photo-change'
              />{' '}
              <span className='edit-cover-photo'>Edit Cover Photo</span>
            </Button>
          </div>
        )}
      </Box>
      <Container className='px-0'>
        <Row className='mx-0 mt-5 pt-2 align-items-start'>
          {/* Profile Left Pane */}
          <Col
            md={12}
            lg={3}
            className='hang-in no-hang-in-md hang-in-lg d-flex flex-lg-column flex-sm-row flex-column mt-3 pl-sm-3 px-0 my-sm-0'>
            <InfoCard
              title='Bio'
              icon={<FAIcon name='user' fontSize='1.5em' />}
              data={basicInfo}
              bgcolor='#fff'
              boxShadow='none'
              padding='1rem 0.75rem 0.75rem'
              className='mr-sm-3'
            />
            <InfoCard
              title='Education'
              icon={<FAIcon name='university' fontSize='1.5em' />}
              data={academicInfo}
              bgcolor='#fff'
              boxShadow='none'
              padding='1rem 0.75rem 0.75rem'
              className='mr-sm-3'
            />
          </Col>

          <Col
            // md={6}
            sm={12}
            lg={9}
            className='d-flex align-items-start flex-column flex-md-row px-0'>
            {/* Profile Middle Pane */}
            <Col
              xs={12}
              md={7}
              className='hang-in px-0 pl-md-3 pl-lg-4 pr-md-1 pr-lg-2 order-1 order-sm-1 order-md-0'>
              <Switch>
                {selfView && (
                  <Route
                    path='/@:userId/colleagues'
                    exact
                    component={ColleagueView}
                  />
                )}
                <Route path='/@:userId' exact component={ProfileFeeds} />
                <Redirect to={`/@${data.username}`} />
              </Switch>
            </Col>

            {/* Profile Right Pane */}
            <Col
              xs={12}
              md={5}
              className='hang-in order-0 order-sm-0 order-md-1 mb-1 px-0 px-sm-3'>
              <InfoCard
                title='Colleagues'
                icon={<FAIcon name='user-friends' fontSize='1.5em' />}
                data={academicInfo}
                type='colleague'
                bgcolor='#fff'
                boxShadow='none'
                padding='1rem 0.75rem 0.75rem'
                className='mb-4'
              />
            </Col>
          </Col>
        </Row>
      </Container>
    </Box>
  );
};

const mapStateToProps = (state: any) => ({
  auth: state.auth,
  userData: state.userData,
  profileData: state.profileData,
  deepProfileData: state.deepProfileData,
  addColleagueStatus: state.addColleagueStatus,
  fetchDeepProfileStatus: state.fetchDeepProfileStatus,
  removeColleagueStatus: state.removeColleagueStatus,
  acceptColleagueStatus: state.acceptColleagueStatus,
  declineColleagueStatus: state.declineColleagueStatus,
  unColleagueStatus: state.unColleagueStatus
});

export default connect(mapStateToProps)(Profile);
