import React, { createRef } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Button from '@material-ui/core/Button';

import { FetchState, ColleagueData } from '../../../types';
import { getColleagues } from '../../../actions';
import { dispatch } from '../../../utils';
import { Empty, User, InfoCard, FAIcon } from '../../shared';

export const navBarObserveeRef = createRef<HTMLElement | null>();

const ProfileRightPane = (props: {
  colleagues: FetchState<ColleagueData[]>;
  profileUserId: string;
  colleague_count: number;
  isAuthenticated?: boolean;
}) => {
  const {
    colleagues: _colleagues,
    profileUserId,
    colleague_count,
    isAuthenticated
  } = props;
  const colleaguesIsPending = _colleagues.status === 'pending';
  const isFetching =
    /fetching\smore/.test(_colleagues.statusText || '') || colleaguesIsPending;
  const thatsAll = /reached\send/.test(_colleagues.statusText || '');
  const colleaguesData = colleaguesIsPending
    ? (Array((colleague_count > 5 ? 5 : colleague_count) || 5).fill(
        {}
      ) as ColleagueData[])
    : _colleagues.data;
  const shouldRenderMoreButton =
    (colleague_count > 5 || !thatsAll) &&
    (colleaguesData?.length !== colleague_count || isFetching);
  const offset = colleaguesData?.slice(-1)[0]?.since;

  if (!isAuthenticated) return null;

  return (
    <Col
      xs={12}
      md={5}
      className='ProfileRightPane hang-in-md no-hang-in order-0 order-sm-0 order-md-1 mb-1 px-0 px-sm-3'>
      <Container className='nav-bar-observee' ref={navBarObserveeRef as any} />
      <InfoCard
        title={`Colleagues (${
          colleaguesIsPending
            ? '0/0'
            : `${_colleagues.data?.length}/${colleague_count}`
        })`}
        icon={<FAIcon name='user-friends' fontSize='1.5em' />}
        type='colleague'
        bgColor='#fff'
        padding='0 0.75em 0.75em 0.75em'
        className='mb-2 custom-scroll- medium-bar rounded-bar'
        headerClassName='py-3'>
        {' '}
        <Row className='mx-0'>
          {colleaguesData!.length ? (
            colleaguesData!.map((colleague, i) => (
              <User {...colleague} linkify={true} key={i} />
            ))
          ) : (
            <Empty
              headerText='No Colleagues'
              riderText='User has no colleagues yet.'
              imageWidth='60%'
            />
          )}
          {shouldRenderMoreButton && (
            <Col xs={12} className='px-1 text-center mb-1'>
              <Button
                variant='contained'
                size='small'
                className='btn-primary px-3 mt-2 py-1'
                color='default'
                disabled={isFetching}
                onClick={() => {
                  dispatch(
                    getColleagues(profileUserId, 'is fetching more', offset)
                  );
                }}>
                {isFetching ? 'Fetching...' : 'See more'}
                <FAIcon
                  name='sync-alt'
                  className={`ml-2 ${isFetching ? 'rotate-infinitely' : ''}`}
                  fontSize='1.15em'
                />
              </Button>
            </Col>
          )}
        </Row>
      </InfoCard>
    </Col>
  );
};

export default React.memo(ProfileRightPane);
