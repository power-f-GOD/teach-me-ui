import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

//Redirects all requests to https..
import HttpsRedirect from 'react-https-redirect';

import { StylesProvider } from '@material-ui/core/styles';

import App from './App';
import store from './appStore';
import './styles/index.min.css';

export const userDeviceIsMobile = /(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i.test(
  window.navigator.userAgent
);

if (userDeviceIsMobile) {
  document.body.classList.add('mobile');
} else {
  document.body.classList.add('desktop');
}

ReactDOM.render(
  
  <Provider store={store}>
    <HttpsRedirect>
      <StylesProvider injectFirst>
        <App />
      </StylesProvider>
    </HttpsRedirect>
  </Provider>,
  document.querySelector('#root') || document.createElement('div')
);


