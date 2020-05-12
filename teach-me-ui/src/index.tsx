import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import HttpsRedirect from 'react-https-redirect';

import { StylesProvider } from '@material-ui/core/styles';

import App from './App';
import store from './appStore';
import './styles/index.min.css';

export const createMemo = () => React.memo((props: any) => {
  const Component = props.memoizedComponent;
  let _props = { ...props };

  if (!Component) {
    throw Error('You\'re probably missing the \'memoizedComponent\' prop for Memoize.');
  }

  delete _props.memoizedComponent;
  return <Component {..._props} />;
})

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
