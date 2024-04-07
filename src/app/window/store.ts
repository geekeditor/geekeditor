import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { IWinTab, IWin, EWinTabType, IWinAction } from '../../types/win.d';
import { createWinTabID, createWinID } from './utils'
import proxy from '../../proxy'
import { EDocsProviderType, IDocsNodeBase } from '../../types/docs.d';
import sharedPreferencesKeys from '../../utils/sharedPreferencesKeys';
import sharedPreferences from '../../utils/sharedPreferences';
import { tableElements } from 'juice';
import { nodePath } from '../../docs/docsprovider/utils';
import sharedScene from '../../utils/sharedScene';

export const ACTION_TYPE_WIN_TAB_INIT = "ACTION_TYPE_WIN_TAB_INIT"
export const ACTION_TYPE_WIN_TAB_ADD = "ACTION_TYPE_WIN_TAB_ADD"
export const ACITON_TYPE_WIN_TAB_REMOVE = "ACITON_TYPE_WIN_TAB_REMOVE"
export const ACITON_TYPE_WIN_TAB_REMOVE_ALL = "ACITON_TYPE_WIN_TAB_REMOVE_ALL"
export const ACITON_TYPE_WIN_TAB_REMOVE_OTHERS = "ACITON_TYPE_WIN_TAB_REMOVE_OTHERS"
export const ACTION_TYPE_WIN_TAB_ACTIVE = "ACTION_TYPE_WIN_TAB_ACTIVE"
export const ACITON_TYPE_WIN_TAB_EXCHANGE = "ACITON_TYPE_WIN_TAB_EXCHANGE"
export const ACTION_TYPE_WIN_TAB_SPLIT = "ACTION_TYPE_WIN_TAB_SPLIT"
export const ACTION_TYPE_WIN_TAB_CONCAT = "ACTION_TYPE_WIN_TAB_CONCAT"


export function ACTION_WIN_TAB_INIT(tabs: IWinTab[], activeTabID: number) {

    return {
        type: ACTION_TYPE_WIN_TAB_INIT,
        payload: {
            tabs,
            activeTabID
        }
    }

}

export function ACTION_WIN_TAB_ADD(tabType: EWinTabType, node: IDocsNodeBase) {

    const tab: IWinTab = {
        id: createWinTabID(),
        type: tabType,
        floatable: tabType === EWinTabType.WinTabDoc,
        removable: tabType === EWinTabType.WinTabDoc,
        node
    }

    return {
        type: ACTION_TYPE_WIN_TAB_ADD,
        payload: {
            tab
        }
    }

}

export function ACTION_WIN_TAB_REMOVE(tabID: number) {
    return {
        type: ACITON_TYPE_WIN_TAB_REMOVE,
        payload: {
            tabID
        }
    }
}

export function ACTION_WIN_TAB_REMOVE_ALL() {
    return {
        type: ACITON_TYPE_WIN_TAB_REMOVE_ALL,
        payload: {
        }
    }
}

export function ACTION_WIN_TAB_REMOVE_OTHERS() {
    return {
        type: ACITON_TYPE_WIN_TAB_REMOVE_OTHERS,
        payload: {
        }
    }
}

export function ACTION_WIN_TAB_ACTIVE(tabID: number) {
    return {
        type: ACTION_TYPE_WIN_TAB_ACTIVE,
        payload: {
            tabID
        }
    }
}

export function ACTION_WIN_TAB_EXCHANGE(tabID: number, toTabID: number) {
    return {
        type: ACITON_TYPE_WIN_TAB_EXCHANGE,
        payload: {
            tabID,
            toTabID
        }
    }
}

export function ACTION_WIN_TAB_SPLIT(tabID: number) {
    return {
        type: ACTION_TYPE_WIN_TAB_SPLIT,
        payload: {
            tabID
        }
    }
}

export function ACTION_WIN_TAB_CONCAT(tabs: IWinTab[], index: number) {
    return {
        type: ACTION_TYPE_WIN_TAB_CONCAT,
        payload: {
            tabs,
            index
        }
    }
}


function removeTab(tabID: number | undefined, tabs: IWinTab[]) {
    const index = tabs.findIndex((winTab) => winTab.id === tabID);
    if (index !== -1) {
        tabs.splice(index, 1);
        return true;
    }

    return false;
}

function removeOtherTabs(tabID: number | undefined, tabs: IWinTab[]) {

    const tab = tabs.find((t)=>t.id===tabID);

    return tab ? [tab] : []
}

function exchangeTab(tabID: number | undefined, toTabID: number | undefined, tabs: IWinTab[]) {
    const index = tabs.findIndex((winTab) => winTab.id === tabID);
    const toIndex = tabs.findIndex((winTab) => winTab.id === toTabID);
    if (index !== -1 && toIndex != -1) {
        const tab = tabs[index];
        tabs.splice(index, 1);
        if (toIndex >= tabs.length) {
            tabs.push(tab)
        } else {
            if (toIndex > index) {
                tabs.splice(toIndex - 1, 0, tab);
            } else {
                tabs.splice(toIndex, 0, tab);
            }
        }
    }

    return tabs;
}



const winState = { tabs: [], activeTabID: 0, floating: true, id: 0, tabsLiveMap: {}, tabsLiveArr: [] }
function win(state: IWin = winState, action: IWinAction) {
    switch (action.type) {
        case ACTION_TYPE_WIN_TAB_INIT:
            const defaultTabs = action.payload.tabs;
            const activeTabID = action.payload.activeTabID;
            if(defaultTabs) {
                return {...state, tabs: defaultTabs, activeTabID: activeTabID||0}
            }

            return state
        case ACTION_TYPE_WIN_TAB_ADD:
            const tab = action.payload.tab;
            if (tab !== undefined) {
                state.tabs.unshift(tab);
                sharedScene.saveTabsScene(state.tabs, state.activeTabID);
                return { ...state, tabs: [...state.tabs] };
            }
            return state;
        case ACITON_TYPE_WIN_TAB_REMOVE:
            if (removeTab(action.payload.tabID, state.tabs)) {
                sharedScene.saveTabsScene(state.tabs, state.activeTabID);
                return { ...state, tabs: [...state.tabs] };
            }
            return state;
        case ACITON_TYPE_WIN_TAB_REMOVE_OTHERS:
            const activeTabs = removeOtherTabs(state.activeTabID, state.tabs);
            sharedScene.saveTabsScene(activeTabs, state.activeTabID);
            return { ...state, tabs: [...activeTabs] };
        case ACITON_TYPE_WIN_TAB_REMOVE_ALL:
            sharedScene.saveTabsScene([], 0);
            return {...state, activeTabID: 0, tabs: []};
        case ACTION_TYPE_WIN_TAB_ACTIVE:
            sharedScene.saveTabsScene(state.tabs, action.payload.tabID);
            return { ...state, activeTabID: action.payload.tabID };
        case ACITON_TYPE_WIN_TAB_EXCHANGE:
            const exchangeTabs = exchangeTab(action.payload.tabID, action.payload.toTabID, state.tabs);
            sharedScene.saveTabsScene(exchangeTabs, state.activeTabID);
            return { ...state, tabs: [...exchangeTabs] };
        case ACTION_TYPE_WIN_TAB_SPLIT:
            {
                const index = state.tabs.findIndex((winTab) => winTab.id === action.payload.tabID);
                if (index !== -1) {
                    const winTab = state.tabs[index];
                    state.tabs.splice(index, 1);
                    const ACTION_CREATE_STORE = proxy.get('ACTION_CREATE_STORE');
                    if (ACTION_CREATE_STORE) {
                        ACTION_CREATE_STORE([winTab], true);
                    }
                    return { ...state, tabs: [...state.tabs] }
                }
            }
            return state;
        case ACTION_TYPE_WIN_TAB_CONCAT:
            const tabs = action.payload.tabs;
            const index = action.payload.index;
            if (tabs && index !== undefined) {
                const sTabs = state.tabs;
                if (index < sTabs.length - 1) {
                    sTabs.splice(index, 0, ...tabs);
                } else {
                    state.tabs = sTabs.concat(tabs)
                }
                return { ...state, tabs: [...state.tabs] };
            }
            return state;
        default:
            return state;
    }

}


export default function createWinStore(initState?: IWin) {
    initState = initState || { tabs: [], floating: true, id: createWinID(), activeTabID: 0 }
    const winState = { ...initState };
    const store = createStore(win, winState, applyMiddleware(thunk));
    return store;
}