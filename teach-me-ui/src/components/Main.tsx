import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import { Nav, Home, About } from '../components';
import { useMainStyles } from '../styles';
import { connect } from 'react-redux';

const Main = (props: any) => {
  const classes = useMainStyles();
  const { displayName } = props;

  return (
    <Grid className={`${classes.root} fade-in`}>
      <Nav />
      <Container component='div'>
        <Typography component='h1' variant='h5'>
          Welcome, {displayName}! This is the MAIN area!
        </Typography>
        <Switch>
          <Route path={['/', '/home']} exact component={Home} />
          <Route path='/about' component={About} />
        </Switch>
      </Container>
    </Grid>
  );
};

const mapStateToProps = (state: any) => {
  return { displayName: state.displayName };
};

export default connect(mapStateToProps)(Main);
