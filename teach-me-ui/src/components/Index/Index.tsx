import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

import { Nav, Footer, Gallery } from '../crumbs';
import About from './About';
import Landing from './Landing';
import Support from './Support';
import _404 from './_404';
import Profile from '../Main/Profile';
import Home from '../Main/Home';

const Index = (props: any) => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);

  if (props.location.search && !/^\/chat/.test(props.location.pathname)) {
    return <Redirect to={`/search?q=${props.location.search.slice(1)}`} />;
  }

  return (
    <Grid className='index-root-grid custom-scroll-bar fade-in'>
      <Nav location={props.location} />

      <Box className='index-root-box'>
        <Switch>
          <Route path='/p/:id' component={Home} />
          <Route path={['/', '/index']} exact component={Landing} />
          <Route path='/about' component={About} />
          <Route path='/support' component={Support} />
          <Route path={['/search/:query', '/search']} component={Home} />
          <Route
            path={['/@:username', '/@:username/colleagues', '/profile/:id']}
            component={Profile}
          />
          <Route component={_404} />
        </Switch>
      </Box>

      <Footer />
      <Gallery location={props.location} />
    </Grid>
  );
};

export default Index;
