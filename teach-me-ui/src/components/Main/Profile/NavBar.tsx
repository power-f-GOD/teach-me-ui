import React, { useState, createRef } from 'react';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Col from 'react-bootstrap/Col';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import AddColleagueIcon from '@material-ui/icons/PersonAdd';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import PendingIcon from '@material-ui/icons/RemoveCircle';
import RejectIcon from '@material-ui/icons/Close';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import Button from '@material-ui/core/Button';

import { UserData, DeepProfileProps, AuthState } from '../../../types';
import { dispatch, displayModal } from '../../../functions';
import * as api from '../../../actions/profile';
import { EDIT_PROFILE } from '../../../constants';
import { getConversations } from '../../../actions/main/chat';

interface ProfileNavBarProps {
  profileUserData: UserData;
  selfView: boolean;
  location: Location;
  deepProfileData?: any;
  addColleagueStatus?: any;
  fetchDeepProfileStatus?: any;
  removeColleagueStatus?: any;
  acceptColleagueStatus?: any;
  declineColleagueStatus?: any;
  unColleagueStatus?: any;
  userId?: string;
  isAuthenticated?: boolean;
}

export const profileNavWrapperRef = createRef<HTMLElement | null>();

const ProfileNavBar = (props: ProfileNavBarProps) => {
  const {
    profileUserData,
    deepProfileData,
    addColleagueStatus,
    fetchDeepProfileStatus,
    removeColleagueStatus,
    acceptColleagueStatus,
    declineColleagueStatus,
    unColleagueStatus,
    selfView,
    location,
    userId,
    isAuthenticated
  } = props || {};

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
        await dispatch(
          api.addColleague(
            profileUserData?.id || '',
            profileUserData?.username || ''
          )
        );
        break;
      case 'PENDING_REQUEST':
        await dispatch(
          api.removeColleague(
            deepData.request_id as string,
            profileUserData?.id || ''
          )
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
                profileUserData?.username || '',
                profileUserData?.id || ''
              )
            )
          : await dispatch(
              api.declineColleague(
                deepData.request_id as string,
                profileUserData?.id || ''
              )
            );
        break;
      case 'IS_COLLEAGUE':
        await dispatch(api.unColleague(profileUserData?.id || ''));
        break;
    }
    dispatch(getConversations('settled')(dispatch));
  };

  const openEditProfileModal = () => {
    displayModal(true, false, EDIT_PROFILE, { title: 'Edit Profile' });
  };

  const handleEditClick = () => {
    openEditProfileModal();
  };

  return (
    <>
      <Col
        className='profile-nav-bar-wrapper'
        ref={profileNavWrapperRef as any}>
        <Col className='profile-nav-bar d-flex justify-content-center align-items-center'>
          <Link to={`/${userId}`}>
            <div
              className={`nav-item ${
                !/colleagues/.test(location.pathname) ? 'active' : ''
              }`}>
              WALL
            </div>
          </Link>
          {selfView && (
            <Link to={`/${userId}/colleagues`}>
              <div
                className={`nav-item colleague-nav ${
                  /colleagues/.test(location.pathname) ? 'active' : ''
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
        </Col>
      </Col>
    </>
  );
};

const mapStateToProps = (
  state: { userData: UserData; auth: AuthState } & ProfileNavBarProps
) => ({
  deepProfileData: state.deepProfileData,
  addColleagueStatus: state.addColleagueStatus,
  fetchDeepProfileStatus: state.fetchDeepProfileStatus,
  removeColleagueStatus: state.removeColleagueStatus,
  acceptColleagueStatus: state.acceptColleagueStatus,
  declineColleagueStatus: state.declineColleagueStatus,
  unColleagueStatus: state.unColleagueStatus,
  userId: state.userData.id,
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(ProfileNavBar);
