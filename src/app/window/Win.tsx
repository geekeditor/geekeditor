import React, { Component } from 'react'
import { connect } from 'react-redux'
import { EWinTabType, IWinTab } from '../../types/win.d'
import WinTabBar from './WinTabBar'
import {ACTION_WIN_TAB_ADD, ACTION_WIN_TAB_REMOVE, ACTION_WIN_TAB_EXCHANGE, ACTION_WIN_TAB_ACTIVE, ACTION_WIN_TAB_REMOVE_ALL, ACTION_WIN_TAB_REMOVE_OTHERS, ACTION_WIN_TAB_INIT} from './store'
import './Win.less'
import { EDocsNodeType, IDocsCreateDAO, IDocsNodeBase } from '../../types/docs.d'
import WinOperationsTip from './WinOperationsTip'
import WinSideBar from './WinSideBar'
import SketchBar from '../../widgets/SketchBar'
import sharedEventBus from '../../utils/sharedEventBus'
import sharedPreferences from '../../utils/sharedPreferences'
import sharedPreferencesKeys from '../../utils/sharedPreferencesKeys'
import factory from '../../docs/docsprovider/DocsProviderFactory'
import sharedScene from '../../utils/sharedScene'
import { createWinTabID } from './utils'
import DocsNode from '../../docs/docsprovider/DocsNode'

const mapStateToProps = (state: any) => {
    return {
        tabs: state.tabs,
        activeTabID: state.activeTabID
    }
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        onWinTabInit: (tabs: IWinTab[], activeTabID: number) => {
            dispatch(ACTION_WIN_TAB_INIT(tabs, activeTabID))
        },
        onWinTabAdd: (node: IDocsNodeBase) => {
            const tabAction = ACTION_WIN_TAB_ADD(EWinTabType.WinTabDoc, node)
            dispatch(tabAction);
            return tabAction.payload.tab && tabAction.payload.tab.id
        },
        onWinTabRemove: (tabID: number) => {
            dispatch(ACTION_WIN_TAB_REMOVE(tabID))
        },
        onWinTabRemoveAll: () => {
            dispatch(ACTION_WIN_TAB_REMOVE_ALL())
        },
        onWinTabRemoveOthers: () => {
            dispatch(ACTION_WIN_TAB_REMOVE_OTHERS())
        },
        onWinTabActive: (tabID: number) => {
            dispatch(ACTION_WIN_TAB_ACTIVE(tabID))
        },
        onWinTabExchange: (tabID: number, toTabID: number) => {
            dispatch(ACTION_WIN_TAB_EXCHANGE(tabID, toTabID))
        }
    }
}

class Win extends Component<{
    tabs:IWinTab[];
    activeTabID: number;
    onWinTabInit: (tabs: IWinTab[], activeTabID: number)=>void;
    onWinTabAdd: (node:IDocsNodeBase)=>number|undefined;
    onWinTabRemove: (tabID:number)=>void;
    onWinTabActive: (tabID:number)=>void;
    onWinTabRemoveAll: ()=>void;
    onWinTabRemoveOthers: ()=>void;
    onWinTabExchange: (tabID: number, toTabID: number) => void;
    defaultWin?:boolean;
    onActiveTab: (tab: IWinTab|undefined) => void;
    showAppSideBar: boolean;
    onShowAppSideBar: (showAppSideBar: boolean) => void;
}, {
    
    sideBarOpened: boolean;
    sideBarWidth: number;
    lastSideBarWidth: number;
    typoMode: boolean;
    isInit: boolean;
}> {

    private tabBar!: WinTabBar|null;
    constructor(props:any) {
        super(props);
        this.state = {
            sideBarOpened: false,
            sideBarWidth: 300,
            lastSideBarWidth: 300,
            typoMode: false,
            isInit: false
        }
    }

    onSelect = (id: number) => {
        if(this.tabBar) {
            this.tabBar.onSelect(id);
        }
    }

    onWinTabActive = (id: number) => {
        const {onWinTabActive, onActiveTab, tabs} = this.props;
        onWinTabActive(id);
        const tab = tabs.find((tab)=>tab.id===id);
        onActiveTab(tab);
    }

    onRemove = (id: number) => {
        if(this.tabBar) {
            this.tabBar.onRemove(id);
        }
    }

    onTriggerTypoMode = () => {
        this.setState({
            typoMode: !this.state.typoMode,
            sideBarOpened: !this.state.typoMode
        })
    }

    onTriggerSideBar = () => {
        this.setState({
            sideBarOpened: !this.state.sideBarOpened
        })
        sharedEventBus.trigger('onTriggerSideBar', !this.state.sideBarOpened);
    }

    onSketchStart = () => {
        this.setState({
            lastSideBarWidth: this.state.sideBarWidth
        })
    }

    onSketchChange = (width: number) => {
        const newWidth = Math.min(Math.max(width, 200), 500);
        this.setState({
            sideBarWidth: newWidth
        })
    }

    onSketchEnd = () => {
        sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsWindowSideBarWidth, this.state.sideBarWidth)
    }

    componentDidMount() {
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
                    this.props.onWinTabInit(restoreTabs, activeId);


                }

                this.setState({
                    isInit: true
                })
            })
        })
        sharedEventBus.on('onTriggerFullscreen', (fullscreen: boolean) => {
            if (fullscreen) {
                this.setState({
                    sideBarOpened: false
                })
            }
        })
        // document.addEventListener('dblclick', (event: MouseEvent)=>{
        //     if((event.target as Element).closest('.win')) {
        //         this.setState({
        //             sideBarOpened: false
        //         })
        //     }
        // })
        sharedPreferences.ready(()=>{
            const savedWidth = sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsWindowSideBarWidth)
            if(savedWidth) {
                this.setState({
                    sideBarWidth: savedWidth,
                    lastSideBarWidth: savedWidth
                })
            }
        })
    }

    render() {
        const {tabs, onWinTabAdd, onWinTabRemove, onWinTabRemoveAll, onWinTabRemoveOthers, onWinTabExchange, activeTabID, showAppSideBar, onShowAppSideBar} = this.props;
        const {sideBarOpened, sideBarWidth, lastSideBarWidth, typoMode, isInit} = this.state;
        const defaultWin = this.props.defaultWin;
        const Sketch = <SketchBar placementLeft={true} width={lastSideBarWidth} onStart={this.onSketchStart} onEnd={this.onSketchEnd} onChange={this.onSketchChange} />;
        
        return (
                <div className="win">
                    <div className="win-inner" style={{width: sideBarOpened ? `calc(100% - ${sideBarWidth}px)` : '100%'}}>
                        {defaultWin && tabs.length === 0 && <WinOperationsTip />}
                        {isInit && <WinTabBar ref={(tabBar)=>{this.tabBar=tabBar}} typoMode={typoMode} onTriggerTypoMode={this.onTriggerTypoMode} showAppSideBar={showAppSideBar} onShowAppSideBar={onShowAppSideBar} defaultActiveID={activeTabID} defaultWin={defaultWin} tabs={tabs} sideBarOpened={sideBarOpened} onWinTabExchange={onWinTabExchange} onWinTabAdd={onWinTabAdd} onWinTabRemove={onWinTabRemove} onWinTabRemoveAll={onWinTabRemoveAll} onWinTabRemoveOthers={onWinTabRemoveOthers} onWinTabActive={this.onWinTabActive} onTriggerSideBar={this.onTriggerSideBar}/>}
                        
                    </div>
                    <WinSideBar sketchBar={Sketch} typoMode={typoMode} sideBarWidth={sideBarWidth} tabs={tabs} activeTabID={activeTabID} sideBarOpened={sideBarOpened} onSelect={this.onSelect} onRemove={this.onRemove} onExchange={onWinTabExchange}/>
                </div>
        )
    }
}

const CWin = connect(mapStateToProps, mapDispatchToProps)(Win);
export default CWin;