import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import '../src/styles/index.min.css';

ReactDOM.render(<App />, document.querySelector('#root'));

let userDeviceIsMobile = /(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i.test(
  window.navigator.userAgent
);

if (!userDeviceIsMobile) {
  document.body.classList.add('desktop');
} else {
  document.body.classList.remove('desktop');
}
