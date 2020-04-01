import React, { Component } from 'react';
import { connect } from 'react-redux';
import { logoutUser, AppProps as HomeProps } from '../actions';

class Home extends Component<HomeProps, {}> {
  handleLogout = () => {
    const { dispatch } = this.props;
    dispatch!(logoutUser());
  };
  render() {
    const { isLoggingOut, logoutError } = this.props;
    return (
      <div>
        <h1>Welcome to your Dashboard!</h1>
        <button onClick={this.handleLogout}>Logout</button>
        {isLoggingOut && <p>Logging Out....</p>}
        {logoutError && <p>Error logging out</p>}
      </div>
    );
  }
}

const mapStateToProps = (state: HomeProps) => {
  return {
    isLoggingOut: state.auth!.isLoggingOut,
    logoutError: state.auth!.logoutError
  };
};

export default connect(mapStateToProps)(Home);
