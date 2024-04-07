import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import { IWinTab } from '../types/win';
import { ACTION_WIN_ADD } from './win'
import proxy from '../proxy'

import win from './win'
import auth, { ACTION_AUTH_LOGOUT } from './auth'

const reducers = combineReducers({ win, auth });

const store = createStore(reducers, applyMiddleware(thunk));

proxy.set('ACTION_CREATE_STORE', (tabs: IWinTab[], floating: boolean) => {
    store.dispatch(ACTION_WIN_ADD(tabs, 0, floating))
})
proxy.set('ACTION_AUTH_LOGOUT', ()=>{
    store.dispatch(ACTION_AUTH_LOGOUT())
})

export default store;