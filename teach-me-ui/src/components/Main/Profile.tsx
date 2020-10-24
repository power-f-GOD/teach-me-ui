import React, {
  useState,
  useEffect,
  createRef,
} from 'react';

import * as api from '../../actions/profile';
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
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import SchoolOutlinedIcon from '@material-ui/icons/SchoolOutlined';
import Button from '@material-ui/core/Button';

import ModalFrame from '../crumbs/modals';
import Img from '../crumbs/Img';
import ColleagueView from '../crumbs/ColleagueView';
import ProfileFeeds from '../crumbs/ProfileFeeds';
import { UserData, DeepProfileProps } from '../../constants/interfaces';
import { dispatch, cleanUp, displayModal } from '../../functions';
import { getProfileData } from '../../actions';
import { getConversations } from '../../actions/chat';
import Loader from '../crumbs/Loader';
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
  level
] = Array(10).fill('');

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
  firstname = data.firstname || '';
  lastname = data.lastname || '';
  displayName = data.displayName || '';
  email = data.email || '';
  email = email + '';
  // dob = data.date_of_birth?.split('-').reverse().join('-') || '';
  institution = data.institution || '';
  department = data.department || '';
  level = data.level || '';

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
  const onColleagueActionClick = async (e: any) => {
    const deepData = deepProfileData as DeepProfileProps;
    switch (deepData.status) {
      case 'NOT_COLLEAGUES':
        await dispatch(api.addColleague(data.id, data.username));
        break;
      case 'PENDING_REQUEST':
        await dispatch(api.removeColleague(deepData.request_id as string));
        break;
      case 'AWAITING_REQUEST_ACTION':
        if (e.target.id !== 'decline') {
          setAcceptWasClicked(false);
          setDeclineWasClicked(true);
        } else {
          setAcceptWasClicked(true);
          setDeclineWasClicked(false);
        }
        e.target.id !== 'decline'
          ? await dispatch(
              api.acceptColleague(deepData.request_id as string, data.username)
            )
          : await dispatch(api.declineColleague(deepData.request_id as string));
        break;
      case 'IS_COLLEAGUE':
        await dispatch(api.unColleague(data.id));
        break;
    }
    dispatch(getConversations('settled')(dispatch));
    dispatch(api.fetchDeepProfile(data.id));
    setAcceptWasClicked(false);
    setDeclineWasClicked(false);
  };

  basicInfo = [
    { name: 'Firstname', value: firstname },
    { name: 'Lastname', value: lastname },
    { name: 'Username', value: username }
    // { name: 'Date of birth', value: dob },
    // { name: 'Email', value: email }
  ];
  academicInfo = [
    { name: 'Institution', value: institution },
    { name: 'Department', value: department },
    { name: 'Level', value: level }
  ];

  const openEditProfileModal = () => {
    displayModal(true, false, 'EDIT_PROFILE', { title: 'Edit Profile' });
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

    let swipeArea: any = null;

    //hide M-UI's (invisible) swipeArea element for the sake of it not interfering with the edit buttons on the right when they're tapped on mobile devices
    window.setTimeout(() => {
      swipeArea = document.querySelector("[class*='SwipeArea']") as any;

      if (swipeArea) {
        swipeArea.style.display = 'none';
      }
    }, 200);

    return () => {
      if (swipeArea) swipeArea.style.display = 'block';

      window.scrollTo(0, 0);
    };
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

  if (
    !/chat=o1/.test(window.location.search) &&
    profileData.status !== 'fulfilled'
  ) {
    //instead of this, you can use a React Skeleton loader; didn't have the time to add, so I deferred.
    return <Loader />;
  }

  const openProfilePhotoEditModal = () => {
    displayModal(true, false, 'SELECT_PHOTO', { title: 'Select Profile Photo' });
  }

  const openCoverPhotoEditModal = (e: any) => {
    displayModal(true, false, 'SELECT_PHOTO', { title: 'Select Cover Photo' });
  }

  return (
    <Box className={`Profile ${selfView ? 'self-view' : ''} fade-in pb-3`}>
      <ModalFrame />
      <Box component='div' className='profile-top'>
        <Img alt={displayName} className='cover-photo' src={data.cover_photo} />
        <Container className='details-container'>
          <div>
            <Avatar
              component='span'
              className='profile-avatar-x profile-photo'
              alt={displayName}
              src={data.profile_photo}
            />
            {selfView && (
              <div onClick={openProfilePhotoEditModal} className='profile-photo-change-container'>
                <PhotoCameraIcon className='profile-photo-change'/>
              </div>
            )}
          </div>

          <Col className='d-flex flex-column px-4 pt-2'>
            <Col as='span' className='display-name p-0 my-1'>
              {displayName}
            </Col>
            <Col as='span' className='username p-0 mb-3'>
              {userId}
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
                    disabled={addColleagueStatus.status === 'pending'}
                    onClick={onColleagueActionClick}>
                    {addColleagueStatus.status === 'pending' ? (
                      <Box textAlign='center'>
                        <CircularProgress size='2rem' />
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
                    disabled={removeColleagueStatus.status === 'pending'}
                    onClick={onColleagueActionClick}>
                    {removeColleagueStatus.status === 'pending' ? (
                      <Box textAlign='center'>
                        <CircularProgress size='2rem' />
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
                        acceptWasClicked &&
                        acceptColleagueStatus.status === 'pending'
                      }
                      onClick={onColleagueActionClick}>
                      {acceptWasClicked &&
                      acceptColleagueStatus.status === 'pending' ? (
                        <Box textAlign='center'>
                          <CircularProgress size='2rem' />
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
                        declineWasClicked &&
                        (declineColleagueStatus.status === 'pending' ||
                          fetchDeepProfileStatus.status === 'pending')
                      }
                      onClick={onColleagueActionClick}>
                      {declineWasClicked &&
                      (declineColleagueStatus.status === 'pending' ||
                        fetchDeepProfileStatus.status === 'pending') ? (
                        <Box textAlign='center'>
                          <CircularProgress size='2rem' />
                        </Box>
                      ) : (
                        <>
                          <RejectIcon fontSize='inherit' /> Decline
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
                    disabled={unColleagueStatus.status === 'pending'}
                    onClick={onColleagueActionClick}>
                    {unColleagueStatus.status === 'pending' ? (
                      <Box textAlign='center'>
                        <CircularProgress size='2rem' />
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
              ) : ''}
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
        <div className='change-cover'>
          {selfView && (
            <Button
              variant='contained'
              size='small'
              className='cover-button'
              color='default'
              onClick={openCoverPhotoEditModal}>
                <PhotoCameraIcon fontSize='inherit' /> Edit Cover Photo
            </Button>
          )}
        </div>
      </Box>
      <Container className='px-0'>
        <Row className='mx-0 mt-5 pt-3 align-items-start'>
          <Col sm={12} md={4} className='hang-in my-3 pb-3 my-sm-0'>
            {selfView && (
              <Box className='details-card px-3 py-3 mb-3'>
                <Col className='py-0 px-2 d-flex justify-content-between align-items-center'>
                  <Box component='h2' className='mr-auto'>
                    Basic Info
                  </Box>
                  <AccountCircleOutlinedIcon className='' fontSize='large' />
                </Col>
                <Box className='basic-info-section-wrapper'>
                  <Row
                    className='basic-info-wrapper mx-0'>
                    {basicInfo.map(({ name, value }: InfoProps) => (
                      <Info name={name} value={value} key={name} />
                    ))}
                  </Row>
                </Box>
              </Box>
            )}
            <Box className='details-card px-3 py-3'>
              <Col className='py-0 px-2 d-flex justify-content-between align-items-center'>
                <Box component='h2' className='mr-auto'>
                  Academic info
                </Box>
                <SchoolOutlinedIcon className='' fontSize='large' />
              </Col>
              <Box className='academic-info-section-wrapper'>
                <Row
                  className='academic-info-wrapper mx-0'>
                  {academicInfo.map(({ name, value }: InfoProps) => (
                    <Info name={name} value={value} key={name} />
                  ))}
                </Row>
              </Box>
            </Box>
          </Col>
          <Col sm={12} md={8} className='px-3'>
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
        </Row>
      </Container>
      <Container className='rows-wrapper d-none custom-scroll-bar small-bar rounded-bar tertiary-bar p-0'>
        <Row as='section' className='m-0 px-3 flex-column mb-5'>
          <Box
            className={`action-buttons-container ${
              /*passedThreshold*/ 'apiNotReady' && false ? 'add-background' : ''
            } ${selfView ? 'self-view' : ''}`}>
            {selfView ? (
                <>
                  <Button
                    variant='contained'
                    size='large'
                    className='edit-button'
                    color='primary'
                    onClick={handleEditClick}>
                        <CreateOutlinedIcon fontSize='inherit' /> Edit Profile
                  </Button>
                </>
                ) : '' }
          </Box>

          {/* <Col className='p-0 d-flex justify-content-center'>
            <Avatar
              component='span'
              className='profile-avatar'
              alt={displayName}
              src={`/images/${avatar}`}
            />
          </Col>
          <Col className='d-flex flex-column p-0'>
            <Col as='span' className='display-name p-0 d-block my-1'>
              {displayName}
            </Col>
            <Col
              as='span'
              className='username p-0 d-flex justify-content-center mb-3'>
              {userId}
            </Col>
            <Col as='span' className='status p-0 px-3 d-block'>
              Currently creating some amazing sturvs...
            </Col>
          </Col> */}
        </Row>

        <Row
          as='section'
          className='info-rows-container justify-content-center m-0'>
          {false && selfView && (
            <Col lg={6} className='info-card-container py-0'>
              <Row as='section' className='basic-info-card mx-0 flex-column'>
                <Col className='info p-0 d-flex my-1'>
                  <Col className='py-0 px-2 d-flex justify-content-between align-items-center'>
                    <Box component='h2' className='card-title mr-auto'>
                      Basic info
                    </Box>
                    <AccountCircleOutlinedIcon className='' fontSize='large' />
                  </Col>
                </Col>

                <hr />

                <Box className='basic-info-section-wrapper'>
                  <Row
                    className='basic-info-wrapper mx-0'>
                    {basicInfo.map(({ name, value }: InfoProps) => (
                      <Info name={name} value={value} key={name} />
                    ))}
                  </Row>
                </Box>
              </Row>
            </Col>
          )}

          {false && (
            <Col lg={6} className='info-card-container py-0'>
              <Row as='section' className='academic-info-card mx-0'>
                <Col className='info p-0 d-flex my-1'>
                  <Col className='py-0 px-2 d-flex justify-content-between align-items-center'>
                    <Box component='h2' className='card-title mr-auto'>
                      Academic info
                    </Box>
                    <SchoolOutlinedIcon className='' fontSize='large' />
                  </Col>
                </Col>

                <hr />

                <Box className='academic-info-section-wrapper'>
                  <Row
                    className='academic-info-wrapper mx-0'>
                    {academicInfo.map(({ name, value }: InfoProps) => (
                      <Info name={name} value={value} key={name} />
                    ))}
                  </Row>
                </Box>
              </Row>
            </Col>
          )}
        </Row>
      </Container>
    </Box>
  );
};

function Info({ name, value }: any) {
  return (
    <Col
      xs={/email|institution/i.test(name) ? 12 : 6}
      className='info p-0 d-flex mb-3 mt-2'>
      <Col as='span' className='py-0 d-flex flex-column align-items-start px-2'>
        <Box component='span' className='info-name'>
          {name}:
        </Box>
        <Box component='span' className='info-value'>
          {value}
        </Box>
      </Col>
    </Col>
  );
}

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
