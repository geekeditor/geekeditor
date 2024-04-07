import React, { Component } from 'react'
import { EWinTabType, IWinTab } from '../../types/win.d'
import { PlusOutlined, LeftOutlined, RightOutlined, LoadingOutlined, EllipsisOutlined, ExclamationCircleOutlined, CloseOutlined, DownOutlined, MenuFoldOutlined, MenuOutlined, ExportOutlined, SearchOutlined, AimOutlined, SwapOutlined } from "@ant-design/icons"
import { Button, Divider, Dropdown, Menu, Popover } from 'antd'
import { IDocsNodeBase } from '../../types/docs';

import WinTabHeaderDoc from './WinTabHeaderDoc'
import WinTabContentDoc from './WinTabContentDoc'
import WinOpenedList from './WinOpenedList';
import WinTabRemove from "./tools/WinTabRemove";

export default class WinTabBar extends Component<{
    tabs: IWinTab[];
    activeTabID: number;
    onOpen: (node: IDocsNodeBase) => void;
    onSelect: (tabId: number) => void;
    onRemove: (tabId: number) => void;
    onRemoveAll: () => void;
    onRemoveOthers: ()=>void;
    onExchange: (tabID: number, toTabID: number) => void;
    onChangeTitle: (tabId: number) => void;
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

    onSelect = (tabId: number) => {
        this.props.onSelect(tabId)
        this.setState({
            openedBarVisible: false
        })
    }



    render() {
        const { tabs, activeTabID, onOpen, onSelect, onRemove, onRemoveAll, onRemoveOthers, onExchange, onChangeTitle } = this.props;
        const { openedBarVisible, closeBarVisible } = this.state;
        const activeTab = tabs.find((tab) => tab.id === activeTabID) || tabs[0];
        const Tabs: React.ReactNode[] = tabs.map((tab) => {


            const isActive = activeTabID === tab.id;

            return <div className={["win-tab-content-wrap", isActive ? " active" : ""].join("")} key={tab.id}>
                <WinTabContentDoc wrapClassName={isActive ? "active" : ""} isActive={isActive} node={tab.node} onOpen={onOpen} onRemoved={()=>onRemove(tab.id)}/>
            </div>

        })

        const content =
            (<div className="opened-nodes">
                {/* <DocsNodesBar root={parentNode} onActiveNode={this.onActiveNode} onOpen={onOpen} defaultActiveNode={node} /> */}
                <WinOpenedList tabs={tabs} onSelect={this.onSelect} onRemove={onRemove} onExchange={onExchange} activeTabID={activeTabID} />
            </div>);

        return (
            <>

                <div className={["win-tab-header-wrap", " active"].join("")}>

                    {activeTab &&
                        <Popover placement="bottom" open={openedBarVisible} onOpenChange={this.onOpenedBarVisible} content={content} trigger="click" destroyTooltipOnHide={{ keepParent: false }}>
                            <div className='win-tab-header-inner'><WinTabHeaderDoc wrapClassName={"active"} node={activeTab.node} onChangeTitle={onChangeTitle} /></div>
                        </Popover>
                    }
                    {
                        tabs.length && <WinTabRemove onRemoveCurrent={()=>onRemove(activeTab.id)} onRemoveAll={onRemoveAll} onRemoveOthers={onRemoveOthers}/>
                    }



                </div>
                <div className={["win-tabs", tabs.length === 0 ? "win-tabs--empty" : ""].join(' ')}>
                    {Tabs}
                </div>
            </>

        )
    }
}