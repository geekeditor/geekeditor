import React, { Component } from 'react'
import { IWinTab } from '../../types/win.d'
import { IDocsNodeBase } from '../../types/docs';

import WinTabHeaderDoc from './WinTabHeaderDoc'
import WinTabContentDoc from './WinTabContentDoc'

export default class WinTabBar extends Component<{
    tabs: IWinTab[];
    activeTabID: number;
    onOpen: (node: IDocsNodeBase) => void;
    onRemove: (tabId: number) => void;
    onChangeTitle: (tabId: number) => void;
    onRemoveCurrent: () => void;
}, {
    openedBarVisible: boolean;
    closeBarVisible: boolean;
    // tabsLiveMap: { [key: number]: boolean };
    // tabsLiveArr: number[];
}> {
    constructor(props: any) {
        super(props);

        this.state = {
            openedBarVisible: false,
            closeBarVisible: false
            // tabsLiveArr: [],
            // tabsLiveMap: {},
        }

    }

    componentDidMount() {

    }

    componentWillUnmount() {
    }

    onOpenedBarVisible = (visible: boolean) => {
        this.setState({
            openedBarVisible: visible
        })
    }

    onCloseBarVisible = (visible: boolean) => {
        this.setState({
            closeBarVisible: visible
        })
    }



    render() {
        const { tabs, activeTabID, onOpen, onRemove, onChangeTitle, onRemoveCurrent } = this.props;
        const activeTab = tabs.find((tab) => tab.id === activeTabID) || tabs[0];
        const Tabs: React.ReactNode[] = tabs.map((tab) => {
            const isActive = activeTabID === tab.id;
            return <div className={["win-tab-content-wrap", isActive ? " active" : ""].join("")} key={tab.id}>
                <WinTabContentDoc wrapClassName={isActive ? "active" : ""} isActive={isActive} node={tab.node} onOpen={onOpen} onRemoved={() => onRemove(tab.id)} />
            </div>

        })

        return (
            <>
                <div className={["win-tab-header-wrap", " active"].join("")}>
                    {activeTab && <div className='win-tab-header-inner'><WinTabHeaderDoc wrapClassName={"active"} node={activeTab.node} onChangeTitle={onChangeTitle} onRemoveCurrent={onRemoveCurrent}/></div>}
                </div>
                <div className={["win-tabs", tabs.length === 0 ? "win-tabs--empty" : ""].join(' ')}>
                    {Tabs}
                </div>
            </>

        )
    }
}