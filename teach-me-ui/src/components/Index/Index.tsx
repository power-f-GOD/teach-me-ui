import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

import Nav from '../crumbs/Nav';
import About from './About';
import Landing from './Landing';
import Support from './Support';
import Footer from '../crumbs/Footer';
import _404 from './_404';
import Search from '../Main/Search';
import Profile from '../Main/Profile';

const Index = () => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);

  return (
    <Grid className='index-root-grid custom-scroll-bar fade-in'>
      <Nav for='index' />

      <Box className='index-root-box'>
        <Switch>
          <Route path={['/', '/index']} exact component={Landing} />
          
          <Route path='/about' component={About} />
          <Route path='/support' component={Support} />
          <Route path='/search' component={Search} />
          <Route path='/@*' component={Profile} />
          <Route component={_404} />
        </Switch>
      </Box>

      <Footer />
    </Grid>
  );
};

export default Index;
