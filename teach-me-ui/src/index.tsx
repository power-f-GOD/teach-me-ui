import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './styles/index.min.css';

import App from './App';
import store from './appStore';
import { dispatch } from './functions';
import { verifyAuth } from './actions';


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root')
);

let userDeviceIsMobile = /(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i.test(
  window.navigator.userAgent
);

if (userDeviceIsMobile) {
  document.body.classList.add('mobile');
} else {
  document.body.classList.add('desktop');
}

//verify auth and keep user logged in assuming page is refreshed/reloaded
dispatch(verifyAuth()(dispatch));
