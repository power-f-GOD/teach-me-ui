import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import HttpsRedirect from 'react-https-redirect';

import { StylesProvider } from '@material-ui/core/styles';

import './styles/bootstrap-grid.min.css';
import './styles/index.min.css';

import App from './App';
import store from './appStore';

export const userDeviceIsMobile = /(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i.test(
  window.navigator.userAgent
);
export const isMac = /Mac( OS)?/i.test(window.navigator.userAgent);

if (userDeviceIsMobile) {
  document.body.classList.add('mobile');
} else {
  document.body.classList.add('desktop');
}

if (isMac) {
  document.body.classList.add('is-mac');
} else {
  document.body.classList.add('is-mac');
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
