import React, { createRef } from 'react';
import { Switch, Route } from 'react-router-dom';

import Col from 'react-bootstrap/Col';
import ColleagueView from './crumbs/ColleagueView';
import { UserData, FetchState, PostStateProps } from '../../../types';
import { InfoCard, Feeds, FAIcon } from '../../shared';
import ProfileNavBar from './NavBar';
import { POSTS_ANCHOR__PROFILE } from '../../../constants';

export const middlePaneRef = createRef<HTMLElement | null>();

const ProfileMiddlePane = (props: {
  profileData: FetchState<UserData>;
  profilePosts: FetchState<PostStateProps[]>;
  isSelfView: boolean;
  windowWidth: number;
  location: Location;
}) => {
  const {
    profileData,
    profilePosts,
    isSelfView,
    windowWidth,
    location
  } = props;

  return (
    <Col
      xs={12}
      md={7}
      className='middle-pane-wrapper hang-in px-0 pl-md-3 pl-lg-4 pr-md-1 pr-lg-2 order-1 order-sm-1 order-md-0'
      ref={middlePaneRef as any}>
      {/* Profile Nav Bar */}
      {windowWidth > 991 && (
        <ProfileNavBar
          data={profileData.data!}
          selfView={isSelfView}
          location={location}
        />
      )}

      {/* Posts */}
      <InfoCard
        title='Posts'
        icon={<FAIcon name='comments' fontSize='1.5em' />}
        type='colleague'
        bgColor='#fff'
        boxShadow='none'
        hr={false}
        padding='0.75rem'
        className='mb-2 header'
        headerClassName='pb-0'
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
          render={(props) => (
            <Feeds
              {...props}
              anchor={POSTS_ANCHOR__PROFILE}
              anchorProfileData={profileData}
              anchorPosts={profilePosts}
            />
          )}
        />
      </Switch>
    </Col>
  );
};

export default React.memo(ProfileMiddlePane);
