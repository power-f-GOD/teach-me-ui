import React, { useEffect, createRef } from 'react';

import { Redirect, match as Match } from 'react-router-dom';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';
import { UserData, FetchState, AuthState } from '../../../types';
import { dispatch, createObserver } from '../../../functions';
import {
  getProfileData,
  setWindowWidth,
  getDeepProfileData,
  displaySnackbar
} from '../../../actions';
import ProfileNavBar, { profileNavWrapperRef } from './NavBar';
import ProfileHeader from './Header';
import ProfileLeftPane from './LeftPane';
import ProfileMiddlePane from './MiddlePane';
import ProfileRightPane, { navBarObserveeRef } from './RightPane';

/**
 * Please, Do not delete any commented code; You can either uncomment them to use them or leave them as they are
 */

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

// window.addEventListener('popstate', () => {
//   cleanUp(false);
// });

let navBarWrapper: HTMLElement | null = null;
let navBarObservee: HTMLElement | null = null;

let observer: IntersectionObserver;

export interface ProfileProps {
  profileData: FetchState<UserData>;
  userData: UserData;
  windowWidth: number;
  auth: AuthState;
  match: Match<{ username?: string; id?: string }>;
  location: Location;
}

const Profile = (props: ProfileProps) => {
  const {
    profileData: _profileData,
    userData,
    windowWidth,
    auth,
    match,
    location
  } = props;
  const data = _profileData.data ?? ({} as UserData);
  const { isAuthenticated } = auth;
  const username = (
    match.params.username ||
    data.username ||
    ''
  )?.toLowerCase();
  const atUsername = '@' + (username || '');
  const profileId = match.params.id || '';
  const idOrUsername = profileId || username;
  const userNotFound = /user.*not\sfound/.test(_profileData.statusText || '');
  const isSelfView = isAuthenticated ? username === userData.username : false;
  const finalData = { ...(isSelfView ? userData : data), username };

  useEffect(() => {
    navBarObservee = navBarObserveeRef.current;

    if (navBarObservee) {
      observer = createObserver(null, (entries) => {
        entries.forEach((entry) => {
          if (navBarWrapper) {
            navBarWrapper.classList[entry.isIntersecting ? 'remove' : 'add'](
              'observee-is-sticking'
            );
          }
        });
      });

      observer.observe(navBarObservee as Element);

      return () => {
        observer.unobserve(navBarObservee as Element);
      };
    }
  }, []);

  useEffect(() => {
    navBarWrapper = profileNavWrapperRef.current;

    if (navBarObservee && observer) {
      observer[
        windowWidth >= 768 && windowWidth < 992 ? 'observe' : 'unobserve'
      ](navBarObservee);
    }
  }, [windowWidth, isSelfView]);

  useEffect(() => {
    if (!isSelfView && isAuthenticated) {
      dispatch(getDeepProfileData(idOrUsername));
    }

    dispatch(getProfileData(idOrUsername));
    window.scrollTo(0, 0);
  }, [idOrUsername, isAuthenticated, isSelfView]);

  useEffect(() => {
    dispatch(setWindowWidth(window.innerWidth));

    return () => {
      window.scrollTo(0, 0);
    };
  }, []);

  if (userNotFound) {
    dispatch(
      displaySnackbar({
        open: true,
        message: `User with ID, ${profileId || atUsername}, not found.`,
        severity: 'info'
      })
    );
    return <Redirect to={`/404`} />;
  }

  return (
    <Box
      className={`Profile ${isSelfView ? 'self-view' : ''} ${
        _profileData.err ? 'de-animate-skeleton' : ''
      } fade-in pb-3`}>
      {/* Profile Header */}
      <ProfileHeader
        data={finalData}
        isSelfView={isSelfView}
        windowWidth={windowWidth}
      />

      {/* Profile Nav Bar */}
      {windowWidth < 992 && (
        <ProfileNavBar
          data={finalData}
          selfView={isSelfView}
          location={location}
        />
      )}

      <Container className='px-0'>
        <Row className='mx-0 pt-lg-2 mt-lg-5 pt-0 align-items-start'>
          {/* Profile Left Pane */}
          <ProfileLeftPane data={finalData} isSelfView={isSelfView} />

          <Col
            sm={12}
            lg={9}
            className='d-flex align-items-start flex-column flex-md-row px-0'>
            {/* Profile Middle Pane */}
            <ProfileMiddlePane
              data={finalData}
              isSelfView={isSelfView}
              windowWidth={windowWidth}
              location={location}
            />

            {/* Profile Right Pane */}
            <ProfileRightPane />
          </Col>
        </Row>
      </Container>
    </Box>
  );
};

const mapStateToProps = (state: ProfileProps) => ({
  auth: state.auth,
  userData: state.userData,
  profileData: state.profileData,
  windowWidth: state.windowWidth
});

export default connect(mapStateToProps)(Profile);
