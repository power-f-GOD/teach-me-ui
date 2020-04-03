import React from 'react';
import {Nav, Home, About } from '../components';
import { Switch, Route } from 'react-router-dom';



const Main = () => {

  return (
    <div>
      <Nav for='main' />
      <h1>This is the MAIN area!</h1>
      <Switch>
        <Route path={['/', '/home']} exact component={Home} />
        <Route path='/about' component={About} />
      </Switch>
    </div>
    
  );
}

export default Main;
