import React, { useEffect, createRef } from 'react';
import Skeleton from 'react-loading-skeleton';

import { Redirect, Switch, Route, match as Match } from 'react-router-dom';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import Button from '@material-ui/core/Button';

import Img from '../../shared/Img';
import ColleagueView from './crumbs/ColleagueView';
import ProfileFeeds from './crumbs/ProfileFeeds';
import { SELECT_PHOTO } from '../../../constants';
import { UserData, FetchState, AuthState } from '../../../types';
import {
  dispatch,
  cleanUp,
  displayModal,
  createObserver,
  formatMapDateString
} from '../../../functions';
import {
  getProfileData,
  setWindowWidth,
  getDeepProfileData
} from '../../../actions';
// import * as api from '../../../actions/main/profile/profile';
import { InfoCard } from '../../shared/Card';
import { FAIcon } from '../../shared/Icons';
import ProfileNavBar, { profileNavWrapperRef } from './NavBar';
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

export const middlePaneRef = createRef<HTMLElement | null>();
export const profileNavBarObserveeRef = createRef<HTMLElement | null>();

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

let profileNavWrapper: HTMLElement | null = null;
let profileNavBarObservee: HTMLElement | null = null;

let observer: IntersectionObserver;

export interface ProfileProps {
  profileData: FetchState<UserData>;
  userData: UserData;
  windowWidth: number;
  auth: AuthState;
  match: Match;
  location: Location;
}

const Profile = (props: ProfileProps) => {
  const { profileData, userData, windowWidth, auth } = props;
  const data = profileData.data ?? ({} as UserData);
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
  bio = data.bio || '';

  //username of currently authenticated user which will be used to check if the current profile data requested is for another user or currently authenticated user in order to render the views accordingly
  username = '@' + (userData.username || '');

  let { userId } = (props.match.params ?? {}) as any;
  const isId = /^@\w+$/.test('@' + userId);
  userId = isId ? '@' + userId.toLowerCase() : username;
  // here is where the check is made to render the views accordingly
  const isSelf = userId === username;
  let selfView = isAuthenticated ? isSelf : false;

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

  useEffect(() => {
    profileNavBarObservee = profileNavBarObserveeRef.current;

    if (profileNavBarObservee) {
      observer = createObserver(null, (entries) => {
        entries.forEach((entry) => {
          if (profileNavWrapper) {
            profileNavWrapper.classList[
              entry.isIntersecting ? 'remove' : 'add'
            ]('observee-is-sticking');
          }
        });
      });

      observer.observe(profileNavBarObservee as Element);

      return () => {
        observer.unobserve(profileNavBarObservee as Element);
      };
    }
  }, []);

  useEffect(() => {
    profileNavWrapper = profileNavWrapperRef.current;

    if (profileNavBarObservee && observer) {
      observer[
        windowWidth > 767 && windowWidth < 992 ? 'observe' : 'unobserve'
      ](profileNavBarObservee);
    }
  }, [windowWidth, selfView]);

  useEffect(() => {
    if (data.id && !selfView) {
      dispatch(getDeepProfileData(data.id));
    }
    // eslint-disable-next-line
  }, [data.id, selfView, username]);

  useEffect(() => {
    dispatch(setWindowWidth(window.innerWidth));

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
  }, [userId]);

  if (!isId) {
    return <Redirect to={`/${username}`} />;
  } else if (profileData.err || !profileData.data) {
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
              className='profile-avatar profile-photo'
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

          <Col className='px-4 pt-1'>
            <Col as='h1' className='display-name p-0 my-0 d-inline-flex'>
              {selfView ? userData.displayName : displayName}
              {!selfView && !displayName && (
                <>
                  <Skeleton className='on-dark' width={140} />
                  <Skeleton className='on-dark ml-3' width={120} />
                </>
              )}
            </Col>
            <Col as='span' className='username d-block p-0 mb-2'>
              {selfView ? `@${userData.username}` : userId}
              {!selfView && !userId && (
                <Skeleton className='on-dark' width={160} />
              )}
            </Col>
            <Col
              as='span'
              className='theme-tertiary-lightest text-ellipsis p-0 mt-1'>
              <FAIcon name='pen' /> {selfView ? userData.bio : bio}
              {!selfView && !bio && (
                <Skeleton className='on-dark' width={300} />
              )}
            </Col>
            <Col
              as='span'
              className='p-0 theme-tertiary-lighter d-block capitalize my-1'>
              <FAIcon name='calendar-day' /> Joined{' '}
              {formatMapDateString(
                selfView
                  ? userData?.date_joined
                  : profileData.data?.date_joined,
                false,
                true,
                ','
              )}
              {!selfView && !profileData.data?.date_joined && (
                <Skeleton className='on-dark' width={160} />
              )}
            </Col>
          </Col>
        </Container>
        {selfView && (
          <div className='change-cover'>
            <Button
              variant='contained'
              size='small'
              className='cover-button btn-tertiary text px-2 py-1'
              color='default'
              onClick={openCoverPhotoEditModal}>
              <FAIcon name='image' className='mr-2 mx-1' fontSize='1.75em' />
              Edit Cover Photo
            </Button>
          </div>
        )}
      </Box>

      {/* Profile Nav Bar */}
      {windowWidth < 992 && (
        <ProfileNavBar
          profileData={data}
          selfView={selfView}
          location={props.location}
        />
      )}

      <Container className='px-0'>
        <Row className='mx-0 pt-lg-2 mt-lg-5 pt-0 align-items-start'>
          {/* Profile Left Pane */}
          <Col
            md={12}
            lg={3}
            className='hang-in no-hang-in hang-in-lg d-flex flex-lg-column flex-sm-row flex-column mt-3 pl-sm-3 px-0 my-sm-0'>
            {selfView && (
              <InfoCard
                title='Account'
                icon={<FAIcon name='user' fontSize='1.5em' />}
                data={basicInfo}
                bgcolor='#fff'
                boxShadow='none'
                padding='0.75rem'
                className='mr-sm-3'
              />
            )}
            <InfoCard
              title='Education'
              icon={<FAIcon name='university' fontSize='1.5em' />}
              data={academicInfo}
              bgcolor='#fff'
              boxShadow='none'
              padding='0.75rem'
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
              className='middle-pane-wrapper hang-in px-0 pl-md-3 pl-lg-4 pr-md-1 pr-lg-2 order-1 order-sm-1 order-md-0'
              ref={middlePaneRef as any}>
              {/* Profile Nav Bar */}
              {windowWidth > 991 && (
                <ProfileNavBar
                  profileData={data}
                  selfView={selfView}
                  location={props.location}
                />
              )}

              <InfoCard
                title='Posts'
                icon={<FAIcon name='comments' fontSize='1.5em' />}
                type='colleague'
                bgcolor='#fff'
                boxShadow='none'
                hr={false}
                padding='0.75rem'
                className='mb-2 header'
              />
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
              className='hang-in-md no-hang-in order-0 order-sm-0 order-md-1 mb-1 px-0 px-sm-3'>
              <Container
                className='profile-nav-bar-observee'
                ref={profileNavBarObserveeRef as any}
              />
              <InfoCard
                title='Colleagues'
                icon={<FAIcon name='user-friends' fontSize='1.5em' />}
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
  windowWidth: state.windowWidth
});

export default connect(mapStateToProps)(Profile);
