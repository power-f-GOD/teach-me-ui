import React, { useState, useEffect, createRef } from 'react';

import { Link, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import MoreIcon from '@material-ui/icons/MoreHoriz';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import {
  UserData,
  DeepProfileProps,
  AuthState,
  ColleagueAction,
  FetchState,
  APIConversationResponse
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
import { requestColleagueAction, getConversationWith } from '../../../actions';

import Loader from '../../shared/Loaders';
import { FAIcon } from '../../shared/Icons';

interface ProfileNavBarProps {
  data: UserData;
  selfView: boolean;
  location: Location;
  deepProfileData?: FetchState<DeepProfileProps>;
  colleagueAction?: ColleagueAction;
  userId?: string;
  isAuthenticated?: boolean;
  conversationWith: FetchState<APIConversationResponse>;
}

export const profileNavWrapperRef = createRef<HTMLElement | null>();

const ProfileNavBar = (props: ProfileNavBarProps) => {
  const {
    data,
    deepProfileData: _deepProfileData,
    colleagueAction,
    selfView,
    location,
    isAuthenticated,
    conversationWith: _conversationWith
  } = props || {};
  const colleagueActionIsPending =
    colleagueAction?.status === 'pending' ||
    _deepProfileData?.status === 'pending';
  const hasPendingRequest = _deepProfileData?.data?.status === PENDING_REQUEST;
  const isColleague = _deepProfileData?.data?.status === IS_COLLEAGUE;
  const idOrUsername = data.username || data.id || '';

  const [isRespondingView, setIsRespondingView] = useState<boolean>(false);
  const [action, setAction] = useState<{
    text: string;
    iconName: string;
    type: ColleagueAction['action'];
  }>({
    text: 'Add Colleague',
    iconName: 'user-plus',
    type: ADD_COLLEAGUE
  });
  const history = useHistory();

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
          displayName: data?.displayName,
          colleague_id: data?.id,
          request_id: _deepProfileData?.data?.request_id,
          username: data?.username
        }
      })
    );
  };

  const openEditProfileModal = () => {
    displayModal(true, false, EDIT_PROFILE, { title: 'Edit Profile' });
  };

  const handleEditClick = () => {
      openEditProfileModal();
  };

  const deepProfileDataStatus = _deepProfileData?.data?.status;
  useEffect(() => {
    setAction(() => {
      switch (deepProfileDataStatus) {
        case IS_COLLEAGUE:
          return {
            text: 'Colleagues',
            iconName: 'user-check',
            type: UNCOLLEAGUE
          };
        case PENDING_REQUEST:
          return {
            text: 'Respond',
            iconName: 'user-clock',
            type: ACCEPT_REQUEST
          };
        case AWAITING_REQUEST_ACTION:
          return {
            text: 'Cancel Request',
            iconName: 'user-slash',
            type: CANCEL_REQUEST
          };
        default:
          return {
            text: 'Add Colleague',
            iconName: 'user-plus',
            type: ADD_COLLEAGUE
          };
      }
    });
  }, [deepProfileDataStatus]);

  useEffect(() => {
    if (idOrUsername && isColleague)
      dispatch(getConversationWith(idOrUsername));
  }, [isColleague, idOrUsername]);

  return (
    <>
      <Col className='nav-bar-wrapper' ref={profileNavWrapperRef as any}>
        <Col
          className={`nav-bar primary-bar d-flex justify-content-start justify-content-sm-center align-items-center ${
            isRespondingView ? 'is-responding-view' : ''
          }`}>
          <Link
            to=''
            onClick={(e) => e.preventDefault()}
            className='ml-0 ml-sm-2'>
            <div
              className={`nav-item ${
                /@|profile/.test(location.pathname) ? 'active' : ''
              }`}>
              POSTS
            </div>
          </Link>
          {/* <Link to='' onClick={(e) => e.preventDefault()}>
            <div
              className={`nav-item ${
                /questions/.test(location.pathname) ? 'active' : ''
              }`}>
              QUESTIONS
            </div>
          </Link> */}

          {isAuthenticated && (
            <Container className='buttons-wrapper px-0 d-flex ml-auto ml-sm-2'>
              {!selfView ? (
                <>
                  {' '}
                  <Button
                    variant='contained'
                    size='small'
                    className={`colleague-action-button mr-sm-2 primary ${
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
                        <FAIcon name='times-circle' className='ml-2' />
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
                      <>
                        {action.text}
                        <FAIcon name={action.iconName} className='ml-2' />
                      </>
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
                  {/* Accept / Message */}
                  <IconButton
                    size='small'
                    className='check icon-button primary'
                    color='primary'
                    disabled={!isRespondingView}
                    onClick={
                      isColleague
                        ? () => {
                            history.push(
                              `/chat/${_conversationWith.data?.id || 0}?1&ref=${
                                data.username
                              }`
                            );
                          }
                        : onColleagueActionClick(false, ACCEPT_REQUEST)
                    }>
                    <FAIcon name={isColleague ? 'comment-alt' : 'user-check'} />
                    <span className='tool-tip'>
                      {isColleague
                        ? `Chat with ${data.first_name || 'Colleague'}`
                        : 'Accept Request'}
                    </span>
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
                </>
              ) : (
                (
                  <Button
                    variant='contained'
                    size='large'
                    className='colleague-action-button mr-sm-2'
                    color='primary'
                    onClick={handleEditClick}>
                    Edit Profile <FAIcon name='user-edit' className='ml-2' />
                  </Button>
                )
              )}
            </Container>
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
  colleagueAction: state.colleagueAction,
  isAuthenticated: state.auth.isAuthenticated,
  conversationWith: state.conversationWith
});

export default connect(mapStateToProps)(ProfileNavBar);
