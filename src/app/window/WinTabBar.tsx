import React, { Component } from 'react'
import { EWinTabType, IWinTab } from '../../types/win.d'
import { ExclamationCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import { Button } from 'antd'
import { IDocsNode, IDocsNodeBase } from '../../types/docs';

import { throttle } from "../../utils/throttle"
import sharedEventBus from '../../utils/sharedEventBus'
import TransitionModal from '../../widgets/TransitionModal'
import { isCompatible } from '../../utils/browser'
import sharedScene from '../../utils/sharedScene'
import WinTabs from './WinTabs'
import WinTabStatusBar from './WinTabStatusBar'
import WinTabSearch from './tools/WinTabSearch'
import WinTabExport from './tools/WinTabExport'
import WinTabStack from './tools/WinTabStack'
import WinTabMore from './tools/WinTabMore'


const maxLiveTabCount = 10;
export default class WinTabBar extends Component<{
    tabs: IWinTab[];
    onWinTabAdd: (node: IDocsNodeBase) => number | undefined;
    onWinTabRemove: (tabID: number) => void;
    onWinTabRemoveAll: () => void;
    onWinTabRemoveOthers: () => void;
    onWinTabActive: (tabID: number) => void;
    onWinTabExchange: (tabID: number, toTabID: number) => void;
    onTriggerSideBar: () => void;
    defaultWin?: boolean;
    sideBarOpened: boolean;
    defaultActiveID: number;
    showAppSideBar: boolean;
    onShowAppSideBar: (showAppSideBar: boolean) => void;
    typoMode: boolean;
    onTriggerTypoMode: () => void;
}, {
    activeTabID: number;
    canSwipeLeft: boolean;
    canSwipeRight: boolean;
    tabAdding: boolean;

    canBack: boolean;
    canNext: boolean;
    // tabsLiveMap: { [key: number]: boolean };
    // tabsLiveArr: number[];
}> {
    swiperDom: HTMLDivElement | null;
    resize: Function | null;
    private alertModal!: TransitionModal | null;
    stack: IDocsNodeBase[];
    stackIndex: number;
    constructor(props: any) {
        super(props);

        this.state = {
            activeTabID: -1,
            canSwipeLeft: false,
            canSwipeRight: false,
            tabAdding: false,
            canBack: false,
            canNext: false
            // tabsLiveArr: [],
            // tabsLiveMap: {},
        }

        this.swiperDom = null;
        this.resize = null;
        this.stack = [];
        this.stackIndex = 0;
    }

    componentDidMount() {
        const { tabs, defaultActiveID } = this.props;
        if (tabs.length) {
            const tab = this.props.tabs.find((tab) => tab.id === defaultActiveID) || tabs[0];
            this.onOpen(tab.node);
            /*
            this.setStatePromise({ activeTabID: defaultActiveID || tabs[0].id }).then(() => {
                return this.updateSwiperState()
            }).then(this.updateSwiperActivePos)
            */
        } else {
            this.updateSwiperState().then(this.updateSwiperActivePos);
        }

        this.resize = throttle(this.updateSwiperState, 200);
        window.addEventListener('resize', this.onResize);

        if (this.props.defaultWin) {
            sharedEventBus.on('onOpen', (node: IDocsNodeBase) => {
                this.onOpen(node);
            })
        }

    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    setStatePromise = (state: any) => {
        return new Promise((resolve) => {
            this.setState(state, () => {
                resolve(true)
            })
        });
    }

    onResize = () => {
        this.resize && this.resize();
    }

    onSelect = (id: number) => {

        const tab = this.props.tabs.find((tab) => tab.id === id);
        if (tab) {
            this.onOpen(tab.node)
        }

        /*
        this.onDeactivedTab();

        // this.updateTabsLiveMap(id, false);
        this.setStatePromise({
            activeTabID: id
        }).then(this.updateSwiperActivePos).then(this.onActivedTab);

        */
    }

    onRemove = (id: number) => {
        this.onDeactivedTab();

        const { onWinTabRemove, tabs } = this.props;
        const { activeTabID } = this.state;
        let newActiveTabID = activeTabID;

        if (id === activeTabID) {
            const index = tabs.findIndex((tab) => tab.id === activeTabID);
            if (index > 0) {
                newActiveTabID = tabs[index - 1].id;
            } else if (index === 0 && tabs.length > 1) {
                newActiveTabID = tabs[index + 1].id;
            }
        }

        onWinTabRemove(id);
        // this.updateTabsLiveMap(id, true);
        this.setStatePromise({
            activeTabID: newActiveTabID
        }).then(() => {
            return this.updateSwiperState()
        }).then(this.updateSwiperActivePos).then(this.onActivedTab)
    }

    onChangeTitle = (tabId: number) => {
        const { tabs } = this.props;
        const { activeTabID } = this.state;
        sharedScene.saveTabsScene(tabs, activeTabID);
    }

    onAdd = () => {
        sharedEventBus.trigger('onAdd');
    }

    onOpen = (node: IDocsNodeBase, ignore?: boolean) => {

        if (!isCompatible) {
            if (this.alertModal) {
                this.alertModal.showTransition();
            }
            return;
        }


        this.onDeactivedTab();

        const { tabs } = this.props;
        const index = tabs.findIndex((t) => t.type === EWinTabType.WinTabDoc && t.node.tempID === node.tempID);
        if (index !== -1) {
            const tabID = tabs[index].id;
            // this.updateTabsLiveMap(tabID, false);
            this.setStatePromise({
                activeTabID: tabID
            }).then(() => {
                return this.updateSwiperState()
            }).then(this.updateSwiperActivePos).then(this.onActivedTab)
        } else {
            const { onWinTabAdd } = this.props;
            const tabID = onWinTabAdd(node);
            if (tabID) {
                // this.updateTabsLiveMap(tabID, false);
                !node.isLoaded && node.load();
                this.setStatePromise({
                    activeTabID: tabID
                }).then(() => {
                    return this.updateSwiperState()
                }).then(this.updateSwiperActivePos)
            }
        }

        if (!ignore) {
            const lastNode = this.stack[this.stackIndex];
            if (lastNode && lastNode.id === node.id) {
                return
            }

            this.stack = this.stack.slice(0, this.stackIndex + 1);
            this.stack.push(node);
            this.stackIndex = this.stack.length - 1;

            this.setState({
                canBack: !!this.stack[this.stackIndex - 1],
                canNext: !!this.stack[this.stackIndex + 1]
            })
        }
    }



    /*

    updateTabsLiveMap(tabID: number, del: boolean) {

        const { tabsLiveArr, tabsLiveMap } = this.state;
        if (del) {
            if (tabsLiveMap[tabID]) {
                delete tabsLiveMap[tabID];
                const index = tabsLiveArr.findIndex((tab) => tab === tabID);
                if (index !== -1) {
                    tabsLiveArr.splice(index, 1);
                }

                this.setState({
                    tabsLiveMap: { ...tabsLiveMap },
                    tabsLiveArr
                })
            }
        } else {
            const index = tabsLiveArr.findIndex((tab) => tab === tabID);
            if (index !== -1) {
                tabsLiveArr.splice(index, 1);
            }
            tabsLiveArr.push(tabID);
            let needUpdate = false;
            if (!tabsLiveMap[tabID]) {
                tabsLiveMap[tabID] = true;
                needUpdate = true;
            }

            if (tabsLiveArr.length > maxLiveTabCount) {
                const delId = tabsLiveArr[0];
                tabsLiveArr.splice(0, 1);
                delete tabsLiveMap[delId];
                needUpdate = true;
            }

            this.setState({
                tabsLiveMap: needUpdate ? { ...tabsLiveMap } : tabsLiveMap,
                tabsLiveArr
            })
        }

    }
    */

    swiperReady = (ref: HTMLDivElement) => {
        this.swiperDom = ref;
    }

    swipeConent(dir: string) {
        const swiper = this.swiperDom;
        if (swiper) {
            const width = swiper.clientWidth;
            let scrollLeft = swiper.scrollLeft,
                scrollWidth = swiper.scrollWidth;

            if (dir === "left") {
                scrollLeft = Math.max(scrollLeft - width, 0);
            } else {
                scrollLeft = Math.min(scrollLeft + width, scrollWidth - width);
            }

            this.changeSwiperScrollLeft(scrollLeft);

        }

    }

    changeSwiperScrollLeft = (scrollLeft: number) => {
        const swiper = this.swiperDom;
        if (swiper) {
            if (swiper.scrollTo) {
                swiper.scrollTo({
                    top: 0,
                    left: scrollLeft,
                    behavior: "smooth",
                });
            } else {
                swiper.scrollLeft = scrollLeft;
            }

            this.updateSwiperState(scrollLeft);
        }
    }

    updateSwiperState = (scrollLeft?: number) => {
        const swiper = this.swiperDom;
        if (swiper) {
            if (scrollLeft === undefined && swiper.clientWidth > 0) {
                scrollLeft = Math.floor(swiper.scrollLeft / swiper.clientWidth) * swiper.clientWidth;
                swiper.scrollLeft = scrollLeft;
            }

            const newLeft =
                scrollLeft === undefined ? swiper.scrollLeft : scrollLeft;


            return new Promise((resolve) => {
                this.setState({
                    canSwipeLeft: newLeft > 0,
                    canSwipeRight: newLeft + swiper.clientWidth < swiper.scrollWidth
                }, () => {
                    resolve(true)
                })
            })


        }

        return Promise.resolve(false)
    }

    updateSwiperActivePos = () => {
        const activeItem = document.querySelector(".win-tab-header-wrap.active") as HTMLDivElement
        const parentElement = activeItem && activeItem.parentElement;
        if (activeItem && parentElement) {
            let scrollLeft = parentElement.scrollLeft;
            const offsetLeft = activeItem.offsetLeft - parentElement.offsetLeft;
            const activeWidth = activeItem.clientWidth;
            const swiperWidth = parentElement.clientWidth;

            if (offsetLeft < scrollLeft) {
                scrollLeft = offsetLeft;
            } else if (offsetLeft + activeWidth > scrollLeft + swiperWidth) {
                scrollLeft = offsetLeft + activeWidth - swiperWidth;
            }

            this.changeSwiperScrollLeft(scrollLeft);
        }
        this.props.onWinTabActive(this.state.activeTabID)
    }

    onActivedTab = () => {
        const { activeTabID } = this.state
        const { tabs } = this.props;
        const tab = tabs.find((tab) => tab.id === activeTabID);
        if (tab && tab.node) {
            tab.node.actived();
        }
    }

    onDeactivedTab = () => {
        const { activeTabID } = this.state
        const { tabs } = this.props;
        const tab = tabs.find((tab) => tab.id === activeTabID);
        if (tab && tab.node) {
            tab.node.deactived();
        }
    }

    onTriggerAppSideBar = () => {

        const { showAppSideBar, onShowAppSideBar } = this.props;
        onShowAppSideBar(!showAppSideBar);

    }

    onConfirmAlert = () => {
        if (this.alertModal) {
            this.alertModal.hideTransition();
        }
    }

    onContextMenuClick = (e: any) => {
        if (e.key === 'closeAll') {
            const { onWinTabRemoveAll } = this.props;
            onWinTabRemoveAll();
        }
        e.domEvent.stopPropagation();
    }

    onBack = () => {
        let { canBack } = this.state;
        if (canBack) {
            if (!this.stack[this.stackIndex - 1] && this.stack.length == 1) {
                return;
            }
            --this.stackIndex;
            this.onOpen(this.stack[this.stackIndex], true)
            this.setState({
                canBack: !!this.stack[this.stackIndex - 1],
                canNext: !!this.stack[this.stackIndex + 1]
            })
        }
    }

    onNext = () => {
        let { canNext } = this.state;
        if (canNext) {
            if (!this.stack[this.stackIndex - 1] && this.stack.length == 1) {
                return;
            }
            ++this.stackIndex;
            this.onOpen(this.stack[this.stackIndex], true)
            this.setState({
                canBack: !!this.stack[this.stackIndex - 1],
                canNext: !!this.stack[this.stackIndex + 1]
            })
        }
    }

    onRemoveCurrent = () => {
        this.onRemove(this.state.activeTabID)
    }

    render() {
        const { tabs, typoMode, onTriggerTypoMode, sideBarOpened, onTriggerSideBar, onWinTabRemoveAll, onWinTabRemoveOthers, onWinTabExchange, showAppSideBar } = this.props;
        const { activeTabID, canBack, canNext } = this.state;
        const activeTab = tabs.find((tab) => tab.id === activeTabID) || tabs[0];

        return (
            <>
                {
                    <div className={["win-tab-bar", tabs.length === 0 ? "win-tab-bar--empty" : ""].join(' ')}>
                        <div className="win-tab-bar__ops left">
                            <span className={["win-tab-bar__op"].join(' ')} onMouseDown={this.onTriggerAppSideBar}>{showAppSideBar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}</span>
                            <WinTabStack onBack={this.onBack} onNext={this.onNext} canBack={canBack} canNext={canNext} />
                            {/* <WinTabAdd onOpen={this.onOpen} /> */}
                            <WinTabMore activeTabID={activeTabID} tabs={tabs} onOpen={this.onOpen} onRemove={this.onRemove} onSelect={this.onSelect} onExchange={onWinTabExchange} onRemoveCurrent={this.onRemoveCurrent} onRemoveAll={onWinTabRemoveAll} onRemoveOthers={onWinTabRemoveOthers} />
                            
                            {tabs.length > 0 && <WinTabs activeTabID={activeTabID} tabs={tabs} onOpen={this.onOpen} onRemove={this.onRemove} onChangeTitle={this.onChangeTitle} onRemoveCurrent={this.onRemoveCurrent}/>}
                        </div>
                        <div className={["win-tab-bar__docs"].join("")} ref={this.swiperReady}>
                            {/* {Tabs} */}
                        </div>
                        <div className="win-tab-bar__ops right">
                            {/* <span id="app-guide-more" className={["win-tab-bar__op", sideBarOpened ? 'active' : ''].join(' ')} onMouseDown={onTriggerSideBar}><SearchOutlined /></span>
                        <span id="app-guide-more" className={["win-tab-bar__op", sideBarOpened ? 'active' : ''].join(' ')} onMouseDown={onTriggerSideBar}><ExportOutlined /></span> */}
                            
                            {activeTab && <WinTabSearch node={activeTab.node as IDocsNode} />}
                            {/* <span id="app-guide-more" className={["win-tab-bar__op", typoMode ? 'active' : ''].join(' ')} onMouseDown={onTriggerTypoMode}><FormatPainterOutlined /></span>  */}
                            {activeTab && <WinTabExport node={activeTab.node as IDocsNode} />}
                            {/* {activeTab && <WinTabMore activeTabID={activeTabID} tabs={tabs} onRemove={this.onRemove} onSelect={this.onSelect} onExchange={onWinTabExchange} onRemoveCurrent={this.onRemoveCurrent} onRemoveAll={onWinTabRemoveAll} onRemoveOthers={onWinTabRemoveOthers} />} */}
                            {/* {<span id="app-guide-more" className={["win-tab-bar__op", sideBarOpened ? 'active' : ''].join(' ')} onMouseDown={onTriggerSideBar}><EllipsisOutlined /></span>} */}
                        </div>
                    </div>
                }
                {
                    activeTab && <WinTabStatusBar node={activeTab.node} onOpen={this.onOpen} />
                }
                {!isCompatible && <TransitionModal
                    ref={(modal) => { this.alertModal = modal }}
                    title={null}
                    footer={<div className="alert-modal__footer"><div className="alert-modal__footer-right"><Button type="primary" onMouseDown={this.onConfirmAlert} >知道了</Button></div></div>}
                    closable={true}
                    onCancel={this.onConfirmAlert}
                    width={400}
                    top="-300px"
                    maskStyle={{ backgroundColor: 'transparent' }}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    wrapClassName="alert-modal"
                >
                    <div className="alert-modal__content">
                        <div className="alert-modal__title">
                            <ExclamationCircleOutlined className="alert-modal__icon" />
                            <span>当前浏览器尚未兼容</span>
                        </div>
                        <div className="alert-modal__info">
                            <span>已兼容Chrome、Fixfox及Safari浏览器，推荐使用<a target="_blank" href="https://www.google.cn/chrome/">Chrome浏览器</a>，或者Chromium内核浏览器</span>
                        </div>
                    </div>
                </TransitionModal>}
            </>
        )
    }
}