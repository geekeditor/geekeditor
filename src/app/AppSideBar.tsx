import React, { Component } from "react"
import DocsNewBar from "../docs/DocsNewBar";
import AppSideBarProviders from "./AppSideBarProviders";
import AppSideBarDocs from "./AppSideBarDocs";

import "./AppSideBar.less"
import { IDocsNodeBase } from "../types/docs"
import sharedEventBus from '../utils/sharedEventBus'
import AppTheme from "./AppTheme";
import AppSettings from "./AppSettings";
import AppRepo from "./AppRepo";
import { isElectron } from "../utils/utils";
import AppZen from "./AppZen";
import AppAccount from "./AppAccount";

enum EHomeBarTabSelect {
    EHomeBarTabSelectNone,
    EHomeBarTabSelectDocs,
}

export default class AppSideBar extends Component<{
    onActiveNode?: (node: IDocsNodeBase) => void;
    sideBarWidth: number;
    sketchBar: React.ReactNode;
    showAppSideBar: boolean;
    onShowAppSideBar: (showAppSideBar: boolean) => void;
}, {
    tabSelect: string;
}> {


    private newBar!: DocsNewBar|null;
    constructor(props: any) {
        super(props);
        this.state = {
            tabSelect: '',
        }
    }

    onTabSelect = (tab: string) => {
        // const { tabSelect } = this.state;
        this.setState({
            tabSelect: tab
        }, ()=>{
            // if(this.state.tabSelect) {
            //     sharedEventBus.trigger('onAppSideBarTabOpen')
            // }
        })
    }


    onAdd = () => {
        if(this.newBar) {
            this.newBar.show();
        }
    }

    onOpen = (node: IDocsNodeBase) => {
        sharedEventBus.trigger('onOpen', node);
    }

    componentDidMount() {
        
        
        sharedEventBus.on('onAdd', () => {
            this.onAdd();
        })
        sharedEventBus.on('onTriggerFullscreen', (open: boolean) => {
            if(open) {
                this.props.onShowAppSideBar(false)
            }
            
        })
        sharedEventBus.on('onOpenDocs', () => {
            // this.setState({
            //     tabSelect: EHomeBarTabSelect.EHomeBarTabSelectDocs
            // })
        })
        // document.addEventListener('dblclick', (event: MouseEvent)=>{
        //     if((event.target as Element).closest('.win')) {
        //         this.setState({
        //             tabSelect: EHomeBarTabSelect.EHomeBarTabSelectNone
        //         })
        //     }
        // })
    }

    render() {
        const { showAppSideBar, sideBarWidth, sketchBar } = this.props
        const { tabSelect } = this.state;
        const onActiveNode = this.props.onActiveNode;
        
       
        return (
            <>
                <div className="app-side-bar" style={{ width: !showAppSideBar ? `0px` : `${sideBarWidth}px`, borderWidth: !showAppSideBar ? `0px` : `0px`, opacity: !showAppSideBar ? `0` : `1`  }}>
                    <div className="app-side-bar-nav">
                        <div className="app-side-bar-nav__left">
                            {/* <BarItem id="app-guide-new" icon={<SisternodeOutlined />} onClick={this.onAddDocRepo}  tip="添加存储仓库" placement="right" wrapClassName="app-bar-item" /> */}
                            {/* <BarItem icon={<FolderOpenOutlined />} label="导入" wrapClassName="app-bar-item" /> */}
                            
                            <AppSideBarProviders onSelect={this.onTabSelect} providerSelect={tabSelect}/>
                        </div>
                        <div className="app-side-bar-nav__right">
                            
                            
                            {/* {isElectron ? <BarItem id="app-guide-zenmode" icon={zenModeIcon}  wrapClassName="app-bar-item" onClick={this.onZenModeToggle}/> : <BarItem id="app-guide-desktop" icon={<DesktopOutlined />} wrapClassName="app-bar-item" tip="安装浏览器扩展" placement="right" onClick={this.onDownload}/>}
                            
                            <BarItem id="app-guide-darkmode" icon={darkMode ? dayModeIcon : darkModeIcon} wrapClassName="app-bar-item" onClick={this.onDarkModeToggle}/> */}
                            
                            <AppRepo />
                            {/* {isElectron && <AppZen />} */}

                            {/* <AppTheme /> */}

                            <AppSettings />

                            <AppAccount />
                            
                            {/* <BarItem id="app-guide-setting" icon={<SettingOutlined />} wrapClassName="app-bar-item" onClick={this.onOpenSettings} /> */}

                            

                            {/* {isElectron ? <BarItem id="app-guide-alwaystop" icon={isAlwaysOnTop ? <PushpinFilled /> : <PushpinOutlined />} wrapClassName="app-bar-item" onClick={this.onAlwaysOnTopToggle} selected={isAlwaysOnTop}/> :
                            <Popover placement="rightTop" content="查看操作引导帮助" visible={showGuideTip}><BarItem icon={<QuestionCircleOutlined />} wrapClassName="app-bar-item" onClick={this.onOpenGuide}/></Popover>}

                            <AppQRCode />  */}
                        </div>
                    </div>
                    <div className="app-side-bar-tab">
                        {/* <div className="app-side-bar-tab__docs" style={{ display: tabSelect !== "" ? 'none' : 'block' }}>
                            <Docs onActiveNode={onActiveNode} onOpen={this.onOpen} />
                        </div> */}
                        <AppSideBarDocs onActiveNode={onActiveNode} onOpen={this.onOpen} providerSelect={tabSelect}/>
                        
                    </div>
                    {showAppSideBar && sketchBar}
                </div>
                <DocsNewBar onOpen={this.onOpen} ref={(newBar)=>{this.newBar=newBar}} />
            </>
        )
    }
}