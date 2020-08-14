import React, { useState, FunctionComponent } from 'react';

import Col from 'react-bootstrap/Col';

import { connect } from 'react-redux';

import { useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';

import {
  useFetchColleagueRequests,
  useDeclineColleagueRequest,
  useFetchColleagues,
  useUnColleague
} from '../../hooks/api';
import {
  UserData,
  ColleagueRequestProps,
  ColleagueProps
} from '../../constants';
import { cleanUp } from '../../functions';

export default (props: any) => {
  const [active, setActive] = useState<'1' | '2'>('1');

  const onTabClick = (e: any) => {
    setActive(e.target.id);
  };
  return (
    <Col className='col-8'>
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
    </Col>
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
  const { userData } = props;

  const token = (userData as UserData).token as string;

  const [, fetchColleaguesData, fetchColleagueIsLoading] = useFetchColleagues(
    token
  );
  const colleagues = fetchColleaguesData?.colleagues || [];

  return colleagues.length === 0 ? (
    <Empty loading={fetchColleagueIsLoading} />
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

  const onView = (e: any) => {
    cleanUp(true);
    history.push(`/@${colleague.username}`);
  };
  const onRemove = (e: any) => {
    fn().then((_) => {
      setRemoved(true);
      setTimeout(() => {
        setCollapsed(true);
      }, 1500);
    });
  };
  return (
    <Collapse in={!collapsed}>
      <div className={`d-flex p-2 ${removed ? 'removed-request' : ''}`}>
        <Avatar
          component='span'
          className='chat-avatar request-avatar'
          alt={colleague.firstname}
          src={`/images/avatar-1.png`}
        />
        <div className='d-flex justify-content-around flex-column'>
          <div>
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
  const { userData } = props;
  const token = (userData as UserData).token as string;
  const [
    ,
    fetchRequestsData,
    fetchColleagueRequestsIsLoading
  ] = useFetchColleagueRequests(token);
  const colleagueRequests = fetchRequestsData?.requests || [];

  return colleagueRequests.length === 0 ? (
    <Empty loading={fetchColleagueRequestsIsLoading} />
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

  const onView = (e: any) => {
    cleanUp(true);
    history.push(`/@${request.sender.username}`);
  };
  const onRemove = (e: any) => {
    fn().then((_) => {
      setRemoved(true);
      setTimeout(() => {
        setCollapsed(true);
      }, 1500);
    });
  };
  return (
    <Collapse in={!collapsed}>
      <div className={`d-flex p-2 ${removed ? 'removed-request' : ''}`}>
        <Avatar
          component='span'
          className='chat-avatar request-avatar'
          alt={request.sender.firstname}
          src={`/images/avatar-1.png`}
        />
        <div className='d-flex justify-content-around flex-column'>
          <div>
            You have received a colleague request from{' '}
            <b>
              {request.sender.firstname} {request.sender.lastname}
            </b>
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
  userData: state.userData
});

const ColleagueRequests = connect(mapStateToProps)(ColleagueRequestsBase);
const Colleagues = connect(mapStateToProps)(ColleaguesBase);
