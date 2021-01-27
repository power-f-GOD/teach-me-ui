import React, { useState, useEffect, createRef } from 'react';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import MoreIcon from '@material-ui/icons/MoreHoriz';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloudOffIcon from '@material-ui/icons/CloudOff';

import {
  UserData,
  DeepProfileProps,
  AuthState,
  ColleagueAction,
  FetchState
} from '../../../types';
import { dispatch, displayModal } from '../../../functions';
import {
  EDIT_PROFILE,
  ADD_COLLEAGUE,
  IS_COLLEAGUE,
  PENDING_REQUEST,
  AWAITING_REQUEST_ACTION,
  ACCEPT_REQUEST,
  DECLINE_REQUEST,
  UNCOLLEAGUE,
  CANCEL_REQUEST
} from '../../../constants';
import { requestColleagueAction } from '../../../actions';

import Loader from '../../shared/Loaders';
import { FAIcon } from '../../shared/Icons';

interface ProfileNavBarProps {
  profileData: UserData;
  selfView: boolean;
  location: Location;
  deepProfileData?: FetchState<DeepProfileProps>;
  colleagueAction?: ColleagueAction;
  userId?: string;
  isAuthenticated?: boolean;
}

export const profileNavWrapperRef = createRef<HTMLElement | null>();

const ProfileNavBar = (props: ProfileNavBarProps) => {
  const {
    profileData,
    deepProfileData: _deepProfileData,
    colleagueAction,
    selfView,
    location
  } = props || {};
  const colleagueActionIsPending =
    colleagueAction?.status === 'pending' ||
    _deepProfileData?.status === 'pending';
  const hasPendingRequest = _deepProfileData?.data?.status === PENDING_REQUEST;
  const isColleague = _deepProfileData?.data?.status === IS_COLLEAGUE;

  const [isRespondingView, setIsRespondingView] = useState<boolean>(false);
  const [action, setAction] = useState<{
    jsx: React.ReactFragment;
    type: ColleagueAction['action'];
  }>({
    jsx: <>Add Colleague +</>,
    type: ADD_COLLEAGUE
  });

  const onColleagueActionClick = (
    showRespondButtons?: boolean,
    _action?: ColleagueAction['action'] | null
  ) => () => {
    setIsRespondingView(showRespondButtons ?? false);

    if (_action === null) return;

    dispatch(
      requestColleagueAction({
        action: _action ?? action.type,
        data: {
          displayName: profileData?.displayName,
          colleague_id: profileData?.id,
          request_id: _deepProfileData?.data?.request_id,
          username: profileData?.username
        }
      })
    );
  };

  const openEditProfileModal = () => {
    displayModal(true, false, EDIT_PROFILE, { title: 'Edit Profile' });
  };

  const handleEditClick = () => {
    if (2 > 3) {
      openEditProfileModal();
    }
  };

  const deepProfileDataStatus = _deepProfileData?.data?.status;
  useEffect(() => {
    let action = {
      //NOT_COLLEAGUES -> default
      text: 'Add Colleague',
      iconName: 'user-plus',
      type: ADD_COLLEAGUE
    };

    setAction(() => {
      switch (deepProfileDataStatus) {
        case IS_COLLEAGUE:
          action = {
            text: 'Colleagues',
            iconName: 'user-check',
            type: UNCOLLEAGUE
          };
          break;
        case PENDING_REQUEST:
          action = {
            text: 'Respond',
            iconName: 'user-clock',
            type: ACCEPT_REQUEST
          };
          break;
        case AWAITING_REQUEST_ACTION:
          action = {
            text: 'Cancel Request',
            iconName: 'user-slash',
            type: CANCEL_REQUEST
          };
          break;
      }

      return {
        jsx: (
          <>
            {action.text} <FAIcon name={action.iconName} className='ml-2' />
          </>
        ),
        type: action.type as ColleagueAction['action']
      };
    });
  }, [deepProfileDataStatus]);

  return (
    <>
      <Col
        className='profile-nav-bar-wrapper'
        ref={profileNavWrapperRef as any}>
        <Col
          className={`profile-nav-bar d-flex justify-content-center align-items-center ${
            isRespondingView ? 'is-responding-view' : ''
          }`}>
          <Link to='' onClick={(e) => e.preventDefault()}>
            <div
              className={`nav-item ${
                !/colleagues/.test(location.pathname) ? 'active' : ''
              }`}>
              WALL
            </div>
          </Link>
          {!selfView && (
            <Container className='buttons-wrapper px-0 d-flex '>
              <Button
                variant='contained'
                size='small'
                className={`colleague-action-button add-colleague primary ${
                  isRespondingView ? 'hide' : ''
                }`}
                color='primary'
                disabled={
                  colleagueActionIsPending ||
                  isRespondingView ||
                  !navigator.onLine
                }
                onClick={onColleagueActionClick(
                  hasPendingRequest || isColleague,
                  hasPendingRequest || isColleague ? null : undefined
                )}>
                {!navigator.onLine ? (
                  <>
                    Offline!
                    <CloudOffIcon htmlColor='inherit' className='ml-2' />
                  </>
                ) : colleagueActionIsPending ? (
                  <>
                    A sec...{' '}
                    <Loader
                      type='ellipsis'
                      inline={true}
                      size={6}
                      className='ml-2'
                    />
                  </>
                ) : (
                  <>{action.jsx}</>
                )}
              </Button>
              {/* Go back */}
              <IconButton
                size='small'
                className='back icon-button primary'
                color='primary'
                disabled={!isRespondingView}
                onClick={onColleagueActionClick(false, null)}>
                <FAIcon name='chevron-left' />
                <span className='tool-tip'>Go back</span>
              </IconButton>
              {/* Accept */}
              <IconButton
                size='small'
                className='check icon-button primary'
                color='primary'
                disabled={!isRespondingView || isColleague}
                onClick={onColleagueActionClick(false, ACCEPT_REQUEST)}>
                <FAIcon name='user-check' />
                {!isColleague && (
                  <span className='tool-tip'>Accept Request</span>
                )}
              </IconButton>
              {/* Decline */}
              <IconButton
                size='small'
                className='cancel icon-button primary'
                color='primary'
                disabled={!isRespondingView}
                onClick={onColleagueActionClick(
                  false,
                  hasPendingRequest ? DECLINE_REQUEST : UNCOLLEAGUE
                )}>
                <FAIcon name='user-times' />
                <span className='tool-tip'>
                  {hasPendingRequest ? 'Decline Request' : 'Uncolleague'}
                </span>
              </IconButton>
            </Container>
          )}

          {selfView ? (
            <>
              <Button
                variant='contained'
                size='large'
                className='colleague-action-button add-colleague'
                color='primary'
                onClick={handleEditClick}>
                Edit Profile <FAIcon name='user-edit' className='ml-2' />
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
  colleagueAction: state.colleagueAction
});

export default connect(mapStateToProps)(ProfileNavBar);
