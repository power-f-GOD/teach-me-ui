import React, { useEffect } from 'react';

import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { dispatch, cleanUp } from '../../functions';
import { getProfileData } from '../../actions';
import Loader from '../crumbs/Loader';
/**
 * Please, Do not delete any commented code; You can either uncomment them to use them or leave them as they are
 */

const ProfileRedirect = (props: any) => {
  console.log(props);
  const userId = props.match.params.id;
  const { profileData } = props;
  useEffect(() => {
    cleanUp(true);
    dispatch(getProfileData(userId.replace('@', ''))(dispatch));

    return () => {
      cleanUp(true);
    };
  }, [userId]);

  if (profileData.err || !profileData.data[0]) {
    return <Redirect to='/404' />;
  }

  if (
    !/chat=open/.test(window.location.search) &&
    profileData.status !== 'fulfilled'
  ) {
    //instead of this, you can use a React Skeleton loader; didn't have the time to add, so I deferred.
    return <Loader />;
  }

  return <Redirect to={`/@${profileData.data[0].username}`} />;
};

const mapStateToProps = (state: any, ownProps: any) => ({
  auth: state.auth,
  userData: state.userData,
  profileData: state.profileData,
  ...ownProps
});

export default connect(mapStateToProps)(ProfileRedirect);
