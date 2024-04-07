import React, { Component } from 'react'
import './WinSideBar.less'
import { HistoryOutlined, CopyOutlined } from '@ant-design/icons'
import { Button, Input, Empty } from 'antd'
import BarItem from '../../widgets/BarItem'
import WinMediaBar from './WinMediaBar'
import { IWinTab } from '../../types/win.d';
// const { Search } = Input;

enum ESideBarTabSelect {
    ESideBarTabSelectOpenedDocs,
    ESideBarTabSelectSyncRecords,
    ESideBarTabSelectHotkeys
}

export default class WinTabSideBar extends Component<{
    tabs: IWinTab[];
    activeTabID: number;
    sideBarOpened: boolean;
    sideBarWidth: number;
    sketchBar: React.ReactNode;
    onSelect: (tabId: number) => void;
    onRemove: (tabId: number) => void;
    onExchange: (tabID: number, toTabID: number) => void;
    typoMode: boolean;
}, {
    tabSelect: ESideBarTabSelect
}> {

    onSearchTextChangeProxy!: Function;
    constructor(props: any) {
        super(props);
        this.state = {
            tabSelect: ESideBarTabSelect.ESideBarTabSelectSyncRecords
        }
    }

    onTabSelect = (tab: ESideBarTabSelect) => {
        this.setState({
            tabSelect: tab
        }, () => {
        })
    }

    render() {
        const { tabs, activeTabID, sideBarOpened, sideBarWidth, sketchBar, onRemove, onSelect, onExchange } = this.props;
        const { tabSelect } = this.state;
        return (
            <>
                <div className={["win-side-bar"].join('')} style={{ width: !sideBarOpened ? `0px` : `${sideBarWidth}px`, borderWidth: !sideBarOpened ? `0px` : `1px`, opacity: !sideBarOpened ? `0` : `1` }}>
                    <div className="win-side-bar-header">
                        <BarItem icon={<i className="gei-official-account" style={{color: 'currentColor'}}></i>} wrapClassName="side-bar-item" onClick={() => { this.onTabSelect(ESideBarTabSelect.ESideBarTabSelectSyncRecords) }} selected={tabSelect === ESideBarTabSelect.ESideBarTabSelectSyncRecords} />    
                    </div>
                    <div className="win-side-bar-tabs">
                        <div className="win-side-bar-tab__records" style={{ display: tabSelect !== ESideBarTabSelect.ESideBarTabSelectSyncRecords? 'none' : 'block' }}>
                            <WinMediaBar />
                        </div>

                    </div>
                    {sideBarOpened && sketchBar}
                </div>
            </>
        )
    }
}