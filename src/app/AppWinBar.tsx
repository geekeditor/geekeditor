import React from 'react';
import './AppWinBar.less';
import Win from './window/Win';

import { ACTION_WIN_ADD } from '../store/win';
import { connect, Provider } from 'react-redux';
import { Store } from 'redux'
import { EWinTabType, IWin, IWinAction, IWinTab } from '../types/win.d';
import { createWinTabID } from './window/utils';
import { EDocsNodeType, IDocsCreateDAO, IDocsNodeBase } from '../types/docs.d';
import factory from '../docs/docsprovider/DocsProviderFactory';
import DocsNode from '../docs/docsprovider/DocsNode';
import sharedScene from '../utils/sharedScene';

const mapStateToProps = (state: any) => {
    return {
        stores: state.win.stores
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onWinAdd: (tabs: IWinTab[], activeTabID: number, floating: boolean) => {
            dispatch(ACTION_WIN_ADD(tabs, activeTabID, floating))
        }
    }
}

class AppWinBar extends React.Component<{
    stores: Store<IWin, IWinAction>[];
    onWinAdd: (tabs: IWinTab[], activeTabID: number, floating: boolean) => void;
    onActiveTab: (tab: IWinTab | undefined) => void;
    showAppSideBar: boolean;
    onShowAppSideBar: (showAppSideBar: boolean) => void;
}> {


    componentDidMount() {
        const { onWinAdd, stores } = this.props;
        if (!stores.length) {
            /*
            factory.ready(()=>{
                sharedScene.getTabsScene().then((scene) => {
                    scene = scene || { tabs: [], index: 0 };
                    const tabs = scene.tabs;
                    const index = scene.index;
                    let activeId = 0;
    
                    if (tabs.length) {
    
                        const restoreTabs: IWinTab[] = [];
                         tabs.forEach((tab, i)=>{
                            const provider = factory.children.find((provider)=>provider.providerID===tab.pid) as IDocsCreateDAO;
                            if(provider) {
    
                                const tabId = createWinTabID();
                                if(i === index) {
                                    activeId = tabId
                                }
    
                                const dao = provider.createDAO({
                                    type: EDocsNodeType.EDocsNodeTypeDoc,
                                    id: tab.id,
                                    extension: ".md"
                                })
                                
    
                                restoreTabs.push({
                                    id: tabId,
                                    type: EWinTabType.WinTabDoc,
                                    removable: true,
                                    floatable: true,
                                    node: DocsNode.getNode({
                                        nodeType: EDocsNodeType.EDocsNodeTypeDoc,
                                        dao,
                                        data: {
                                            title: tab.title,
                                            extension: ".md"
                                        }
                                    })
                                }) 
    
                            }
    
                        })
    
                        onWinAdd(restoreTabs, activeId, false);
    
    
    
                    } else {
                        onWinAdd([
                            // { id: createWinTabID(), type: EWinTabType.WinTabHome, removable: false, floatable: false },
                        ], 0, false);
                    }
                })
            })
            */
            
            onWinAdd([
                // { id: createWinTabID(), type: EWinTabType.WinTabHome, removable: false, floatable: false },
            ], 0, false);
        }
    }

    render() {
        const { stores, onActiveTab, showAppSideBar, onShowAppSideBar } = this.props;
        const wins = stores.map((store, index) => {
            return <Provider store={store} key={store.getState().id}><Win onActiveTab={onActiveTab} defaultWin={index === 0} showAppSideBar={showAppSideBar} onShowAppSideBar={onShowAppSideBar}/></Provider>
        })

        return (
            <div className="win-bar">
                {wins}
            </div>
        );
    }
}

const CAppWinBar = connect(mapStateToProps, mapDispatchToProps)(AppWinBar);
export default CAppWinBar;
