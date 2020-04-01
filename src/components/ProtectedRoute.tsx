import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AppProps } from '../actions';

const ProtectedRoute = ({
  component: Component,
  isAuthenticated,
  isVerifying,
  isLoggingOut,
  ...rest
}: AppProps) => (
  <Route
    {...rest}
    render={(props: any) =>
      isVerifying ? (
        <div />
      ) : isAuthenticated || isLoggingOut ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location }
          }}
        />
      )
    }
  />
);

export default ProtectedRoute;
