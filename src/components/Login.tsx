import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import { withStyles } from '@material-ui/styles';

import { loginUser, AppProps as LoginProps, LoginState } from '../actions';
import { styles } from '../styles/login.css';

class Login extends Component<LoginProps, LoginState> {
  state = { email: '', password: '' };

  handleEmailChange = ({ target }: any) => {
    this.setState({ email: target.value });
  };

  handlePasswordChange = ({ target }: any) => {
    this.setState({ password: target.value });
  };

  handleSubmit = () => {
    const [{ dispatch }, { email, password }] = [this.props, this.state];

    dispatch!(loginUser(email, password));
  };

  render() {
    const { classes, loginError, isAuthenticated } = this.props;

    if (isAuthenticated) return <Redirect to='/' />;
    return (
      <Container component='main' maxWidth='xs'>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Sign in
          </Typography>
          <TextField
            variant='outlined'
            margin='normal'
            fullWidth
            id='email'
            label='Email Address'
            name='email'
            onChange={this.handleEmailChange}
          />
          <TextField
            variant='outlined'
            margin='normal'
            fullWidth
            name='password'
            label='Password'
            type='password'
            id='password'
            onChange={this.handlePasswordChange}
          />
          {loginError && (
            <Typography component='p' className={classes.errorText}>
              Incorrect email or password.
            </Typography>
          )}
          <Button
            type='button'
            fullWidth
            variant='contained'
            color='primary'
            className={classes.submit}
            onClick={this.handleSubmit}>
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }
}

const mapStateToProps = (state: LoginProps) => {
  return {
    isLoggingIn: state.auth!.isLoggingIn,
    loginError: state.auth!.loginError,
    isAuthenticated: state.auth!.isAuthenticated
  };
};

export default withStyles(styles)(connect(mapStateToProps)(Login));
