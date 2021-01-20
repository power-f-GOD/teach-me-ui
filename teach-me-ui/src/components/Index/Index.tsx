import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

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
import ProfileRedirect from '../Main/Profile/Redirect';

const Index = (props: any) => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);

  if (props.location.search) {
    return <Redirect to={`/home${props.location.search}`} />;
  }

  return (
    <Grid className='index-root-grid custom-scroll-bar fade-in'>
      <Nav for='index' />

      <Box className='index-root-box'>
        <Switch>
          <Route path={['/', '/index']} exact component={Landing} />
          <Route path='/about' component={About} />
          <Route path='/support' component={Support} />
          <Route path={['/search/:query', '/search']} component={Search} />
          <Route
            path={['/@:userId', '/@:userId/colleagues']}
            component={Profile}
          />
          <Route path={'/profile/:id'} component={ProfileRedirect} />
          <Route component={_404} />
        </Switch>
      </Box>

      <Footer />
    </Grid>
  );
};

export default Index;
