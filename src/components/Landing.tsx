import React from 'react';

import { Nav, Signin, Signup } from '../components';
import { Switch, Route } from 'react-router-dom';

const Landing = () => {
  return (
    <div>
      <Nav for='landing' />
      <h1>This is the Landing page!</h1>
      <Switch>
        <Route path='/signin' component={Signin} />
        <Route path='/signup' component={Signup} />
      </Switch>
    </div>
  );
};

export default Landing;
