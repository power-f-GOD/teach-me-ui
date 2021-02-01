import React, { createRef } from 'react';
import { Switch, Route } from 'react-router-dom';

import Col from 'react-bootstrap/Col';
import ColleagueView from './crumbs/ColleagueView';
import ProfileFeeds from './crumbs/ProfileFeeds';
import { UserData } from '../../../types';
import { InfoCard } from '../../shared/Card';
import { FAIcon } from '../../shared/Icons';
import ProfileNavBar from './NavBar';

export const middlePaneRef = createRef<HTMLElement | null>();

const ProfileMiddlePane = (props: {
  data: UserData;
  isSelfView: boolean;
  windowWidth: number;
  location: Location;
}) => {
  const { data, isSelfView, windowWidth, location } = props;

  return (
    <Col
      xs={12}
      md={7}
      className='middle-pane-wrapper hang-in px-0 pl-md-3 pl-lg-4 pr-md-1 pr-lg-2 order-1 order-sm-1 order-md-0'
      ref={middlePaneRef as any}>
      {/* Profile Nav Bar */}
      {windowWidth > 991 && (
        <ProfileNavBar data={data} selfView={isSelfView} location={location} />
      )}

      {/* Posts */}
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
        {isSelfView && (
          <Route
            path='/@:username/colleagues'
            exact
            component={ColleagueView}
          />
        )}
        <Route
          path={['/@:username', '/profile/:id']}
          component={ProfileFeeds}
        />
      </Switch>
    </Col>
  );
};

export default ProfileMiddlePane;
