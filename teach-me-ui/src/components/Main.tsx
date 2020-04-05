import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import { Nav, Home, About } from '../components';
import { useMainStyles } from '../styles';

const Main = () => {
  const classes = useMainStyles();

  return (
    <Grid className={`${classes.root} fade-in`}>
      <Container component='div'>
        <Nav for='main' />
        <Typography component='h1' variant='h5'>
          This is the MAIN area!
        </Typography>
        <Switch>
          <Route path={['/', '/home']} exact component={Home} />
          <Route path='/about' component={About} />
        </Switch>
      </Container>
    </Grid>
  );
};

export default Main;
