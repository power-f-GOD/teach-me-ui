import React, { useState, FunctionComponent, useEffect } from 'react';

import { connect } from 'react-redux';

import { useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';

import {
  useDeclineColleagueRequest,
  useUnColleague
} from '../../../../hooks/api';
import {
  UserData,
  ColleagueRequestProps,
  ColleagueProps
} from '../../../../types';
import { cleanUp } from '../../../../functions';
import { KAvatar } from '../../../shared';
// import { fetchColleagueRequests, fetchColleagues } from '../../../../actions';

export default () => {
  const [active, setActive] = useState<'1' | '2'>('1');

  const onTabClick = (e: any) => {
    setActive(e.target.id);
  };
  return (
    <Box className='details-card colleague-container'>
      <div className='colleague-nav'>
        <div
          id='1'
          onClick={onTabClick}
          className={`${active === '1' ? 'active' : ''}`}>
          ALL
        </div>
        <div
          id='2'
          onClick={onTabClick}
          className={`${active === '2' ? 'active' : ''}`}>
          REQUESTS
        </div>
      </div>
      {active === '1' && <Colleagues />}
      {active === '2' && <ColleagueRequests />}
    </Box>
  );
};

const Empty = (props: any) => (
  <div className='d-flex'>
    {props.loading ? (
      <CircularProgress className='py-5 mx-auto' color='inherit' size={30} />
    ) : (
      <img
        alt='no data'
        className='mx-auto py-5'
        width={150}
        src='/images/no_data.svg'
      />
    )}
  </div>
);

const ColleaguesBase = (props: any) => {
  const { userData, fetchColleaguesStatus } = props;

  const token = (userData as UserData).token as string;

  const { colleagues } = props;
  useEffect(() => {
    // dispatch(fetchColleagues());
  }, []);

  return colleagues.length === 0 ? (
    <Empty loading={fetchColleaguesStatus.status === 'pending'} />
  ) : (
    <>
      {colleagues.map((x: ColleagueProps, i: number) => (
        <Colleague token={token} colleague={x} key={i} />
      ))}
    </>
  );
};

const Colleague: FunctionComponent<{
  colleague: ColleagueProps;
  token: string;
}> = (props) => {
  const { colleague } = props;

  const history = useHistory();
  const [removed, setRemoved] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [fn, , fnLoading] = useUnColleague(colleague.id, props.token);

  const onView = () => {
    cleanUp(true);
    history.push(`/@${colleague.username}`);
  };
  const onRemove = () => {
    fn().then((_) => {
      setRemoved(true);
      setTimeout(() => {
        setCollapsed(true);
      }, 1500);
    });
  };
  return (
    <Collapse in={!collapsed}>
      <div className={`d-flex p-3 ${removed ? 'removed-request' : ''}`}>
        <KAvatar
          className='chat-avatar request-avatar mr-2'
          alt={colleague.firstname}
          src={
            colleague.profile_photo
              ? colleague.profile_photo
              : '/images/avatar-1.png'
          }
        />
        <div className='d-flex justify-content-around flex-column'>
          <div className='font-bold'>
            {colleague.firstname} {colleague.lastname}
          </div>
          {!removed && (
            <div className='d-flex'>
              <Button
                variant='contained'
                size='small'
                className='view-request-button'
                color='primary'
                onClick={onView}>
                View
              </Button>
              <Button
                variant='contained'
                size='small'
                className='view-request-button delete'
                color='primary'
                onClick={onRemove}>
                {fnLoading ? (
                  <CircularProgress color='inherit' size={15} />
                ) : (
                  <>Remove</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Collapse>
  );
};

const ColleagueRequestsBase = (props: any) => {
  const { userData, colleagueRequests, fetchColleagueRequestsStatus } = props;
  const token = (userData as UserData).token as string;

  useEffect(() => {
    // dispatch(fetchColleagueRequests());
  }, []);
  return colleagueRequests.length === 0 ? (
    <Empty loading={fetchColleagueRequestsStatus.status === 'pending'} />
  ) : (
    <>
      {colleagueRequests.map((x: ColleagueRequestProps, i: number) => (
        <Request token={token} request={x} key={i} />
      ))}
    </>
  );
};

const Request: FunctionComponent<{
  request: ColleagueRequestProps;
  token: string;
}> = (props) => {
  const { request } = props;

  const history = useHistory();
  const [removed, setRemoved] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [fn, , fnLoading] = useDeclineColleagueRequest(
    request.request.id,
    props.token
  );

  const onView = () => {
    cleanUp(true);
    history.push(`/@${request.sender.username}`);
  };
  const onRemove = () => {
    fn().then((_) => {
      setRemoved(true);
      setTimeout(() => {
        setCollapsed(true);
      }, 1500);
    });
  };
  return (
    <Collapse in={!collapsed}>
      <div className={`d-flex p-3 ${removed ? 'removed-request' : ''}`}>
        <KAvatar
          component='span'
          className='chat-avatar request-avatar mr-2'
          alt={request.sender.firstname}
          src={
            request.sender.profile_photo
              ? request.sender.profile_photo
              : '/images/avatar-1.png'
          }
        />
        <div className='d-flex justify-content-around flex-column'>
          <div>
            <span className='font-bold'>
              {request.sender.firstname} {request.sender.lastname}
            </span>{' '}
            sent you a colleague request
          </div>
          {!removed && (
            <div className='d-flex'>
              <Button
                variant='contained'
                size='small'
                className='view-request-button'
                color='primary'
                onClick={onView}>
                View
              </Button>
              <Button
                variant='contained'
                size='small'
                className='view-request-button delete'
                color='primary'
                onClick={onRemove}>
                {fnLoading ? (
                  <CircularProgress color='inherit' size={15} />
                ) : (
                  <>Remove</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Collapse>
  );
};

const mapStateToProps = (state: any) => ({
  userData: state.userData,
  colleagues: state.colleagues,
  colleagueRequests: state.colleagueRequests,
  fetchColleaguesStatus: state.fetchColleaguesStatus,
  fetchColleagueRequestsStatus: state.fetchColleagueRequestsStatus,
  unColleagueStatus: state.unColleagueStatus
});

const ColleagueRequests = connect(mapStateToProps)(ColleagueRequestsBase);
const Colleagues = connect(mapStateToProps)(ColleaguesBase);
