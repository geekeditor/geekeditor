import React from 'react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import ReactDOM from 'react-dom';
import App from './landing/App';
import './i18n';


ReactDOM.render(
    <App />,
  document.getElementById('root')
);

serviceWorkerRegistration.register();