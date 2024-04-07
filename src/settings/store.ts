import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Store } from "redux";
import thunk from 'redux-thunk';


const defaultHosting = {
    platforms: {

    }
}
function imageHosting(state = defaultHosting, action: { type: string; }) {

}


const store = createStore(combineReducers({ hosting: imageHosting }), applyMiddleware(thunk));
export default store;