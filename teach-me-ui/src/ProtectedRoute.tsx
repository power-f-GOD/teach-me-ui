import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// import CircularProgress from '@material-ui/core/CircularProgress';
import { Loader } from './components';

const ProtectedRoute = (props: any) => {
  const { component: Component, status, isAuthenticated } = props;

  return (
    <Route
      render={(props: any) => {
        if (status === 'pending') return <Loader />;

        return isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/signin',
              state: { from: props.location }
            }}
          />
        );
      }}
    />
  );
};

export default ProtectedRoute;
