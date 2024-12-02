import React from 'react';
import ReactDOM from 'react-dom';
import './i18n'
import './themes/default/index.less'
import './themes/dark/index.less'

import './workspace.css';
import App from './app/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { Provider } from "react-redux";
import store from './store'
import 'antd/dist/antd.less'
import proxy from './proxy';
import './utils/encrypt'

(window as any).proxy = proxy;

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
