import React, { Component } from 'react'
import './App.less'

import AppSideBar from './AppSideBar'
import AppTopBar from './AppTopBar'
import AppStatusBar from './AppStatusBar'

import AppWinBar from './AppWinBar'
import SketchBar from '../widgets/SketchBar'
import { isElectron, isMac } from '../utils/utils'

import { EDocsNodeType, IDocsNodeBase } from '../types/docs.d'
import { IWinTab } from '../types/win'
import sharedPreferences from '../utils/sharedPreferences'
import sharedPreferencesKeys from '../utils/sharedPreferencesKeys'
import { Checkbox, notification } from 'antd'
import { NotificationPlacement } from 'antd/lib/notification'
import { WithTranslation, withTranslation } from 'react-i18next'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { version } from '../version'

const getPreloadableLazyComponent = (dynamicImportFactory: any) => {
    const Component: any = React.lazy(dynamicImportFactory);
    ;
    Component.preload = dynamicImportFactory;
    return Component;
};

const LazyPreloadableComponent = getPreloadableLazyComponent(() =>
    import("../editor")
);


(window as any).enterFullscreen = () => {
    document.documentElement.classList.toggle('fullscreen', true)
}
(window as any).leaveFullscreen = () => {
    document.documentElement.classList.toggle('fullscreen', false)
}

const navWidth = 35;
class App extends Component<WithTranslation, {
    activeNode: IDocsNodeBase | undefined;
    activeTabNode: IDocsNodeBase | undefined;
    sideBarWidth: number,
    lastSideBarWidth: number,
    showAppSideBar: boolean
}> {

    constructor(props: any) {
        super(props);
        
        this.state = {
            activeNode: undefined,
            activeTabNode: undefined,
            sideBarWidth: 270,
            lastSideBarWidth: 270,
            showAppSideBar: false
        }
    }

    onSearch = (key: string) => {

    }

    onActiveNode = (node: IDocsNodeBase) => {
        this.setState({
            activeNode: node
        })
    };

    onActiveTab = (tab:IWinTab|undefined) => {
        this.setState({
            activeTabNode: tab?.node
        })
    }

    onSketchStart = () => {
        this.setState({
            lastSideBarWidth: this.state.sideBarWidth
        })
    }

    onSketchChange = (width: number) => {
        const newWidth = Math.min(Math.max(width, 270), 500);
        this.setState({
            sideBarWidth: newWidth
        })
    }

    onSketchEnd = () => {
        sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsAppSideBarTabWidth, this.state.sideBarWidth)
    }

    onShowAppSideBar = (showAppSideBar: boolean) => {
        sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsShowAppSideBar, showAppSideBar)
        this.setState({
            showAppSideBar
        })
    }


    onPreload = () => {
        LazyPreloadableComponent.preload();
    }


    showNewVersionNotification() {
        if (sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsHidePublishNotification) === version) {
            return;
        }

        const {t} = this.props;
        const onCheckBoxChange = (e: CheckboxChangeEvent) => {
            if(e.target.checked) {
                sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsHidePublishNotification, version);
            }
        }
        const args = {
            message: t("notification.newPublishTitle"),
            description: <div className="app-notifaction-detail">{t("notification.newPublishTips")}<a href='https://github.com/geekeditor' target='blank'>https://github.com/geekeditor</a><div style={{marginTop: '10px'}}><Checkbox onChange={onCheckBoxChange} className="app-notication-checkbox">{t("notification.newPublishCheckbox")}</Checkbox></div></div>,
            duration: 30,
            className: 'app-notification',
            key: 'app-new-verison-notification',
            onClose: () => {
            }
        }
        notification.open(args);
    }

    componentDidMount() {
        sharedPreferences.ready(()=>{
            const savedWidth = sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsAppSideBarTabWidth) || this.state.sideBarWidth;
            const showSideBar = sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsShowAppSideBar)
            this.setState({
                sideBarWidth: savedWidth,
                lastSideBarWidth: savedWidth,
                showAppSideBar: showSideBar
            })
        })
        setTimeout(()=>{
            this.showNewVersionNotification()
        }, 2000)
    }

    render() {
        const { activeNode, activeTabNode,  lastSideBarWidth, sideBarWidth, showAppSideBar } = this.state;
        const isFile = activeNode && activeNode.nodeType === EDocsNodeType.EDocsNodeTypeDoc;
        const Sketch = <SketchBar width={lastSideBarWidth} onStart={this.onSketchStart} onEnd={this.onSketchEnd} onChange={this.onSketchChange} />;
        return (
            <div className={["app", isElectron ? " app--electron" : "", isMac ? " app--mac" : ""].join('')} onMouseMove={this.onPreload}>
                {/* {isElectron && <AppTopBar activeNode={activeTabNode}/>} */}
                <div className={["app-main", showAppSideBar ? " app-main--sidebar" : ""].join("")}>
                    <AppSideBar showAppSideBar={showAppSideBar} onShowAppSideBar={this.onShowAppSideBar} sideBarWidth={sideBarWidth} sketchBar={Sketch} onActiveNode={this.onActiveNode} />
                    <div className="app-wins" style={{ width: `calc(100% - ${sideBarWidth}px)` }}>
                        <AppWinBar onActiveTab={this.onActiveTab} showAppSideBar={showAppSideBar} onShowAppSideBar={this.onShowAppSideBar} />
                    </div>
                </div>
               {/* {!isElectron &&  <AppStatusBar />} */}
            </div>
        )
    }
}

export default withTranslation()(App)