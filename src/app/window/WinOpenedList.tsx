import React, { Component } from 'react'
import './WinOpenedList.less'
import { Input, Empty } from 'antd'
import WinOpenedListItem from './WinOpenedListItem'
import { EWinTabType, IWinTab } from '../../types/win.d';
import { regexWithSearchKey } from '../../utils/utils'
import { throttle } from '../../utils/throttle'
import i18n from '../../i18n';
import DocsSearchBar from '../../docs/DocsSearchBar';
import factory from '../../docs/docsprovider/DocsProviderFactory';
import { ClearOutlined } from '@ant-design/icons';
import { IDocsNodeBase } from '../../types/docs';
const { Search } = Input;

export default class WinOpenedList extends Component<{
    tabs: IWinTab[];
    activeTabID?: number;
    onSelect: (tabId: number) => void;
    onRemove: (tabId: number) => void;
    onExchange: (tabID: number, toTabID: number) => void;
    onRemoveAll: () => void;
    onOpen: (node: IDocsNodeBase) => void;
}, {
    searchKey: string;
    dragIndex: number;
    dragToIndex: number;
    dragging: boolean;
    dragTab: IWinTab | null;
    dragPosition: { x: number; y: number; h: number; w: number };
    loading: boolean;
}> {

    onSearchTextChangeProxy!: Function;

    bakPosition = {
        x: 0,
        y: 0
    }
    downX = 0;
    downY = 0;
    constructor(props: any) {
        super(props);
        this.state = {
            searchKey: '',
            dragIndex: -1,
            dragToIndex: -1,
            dragging: false,
            dragTab: null,
            dragPosition: {
                x: 0,
                y: 0,
                h: 0,
                w: 0,
            },
            loading: false
        }

        this.onSearchTextChangeProxy = throttle(this.onSearch, 200);
    }

    onSearch = (key: string) => {
        this.setState({
            searchKey: key
        })
    }

    onSearchTextChange = (event: React.ChangeEvent) => {
        const key = (event.target as HTMLInputElement).value;
        this.onSearchTextChangeProxy(key);
    }

    onDragStart = (event: React.MouseEvent, index: number, tab: IWinTab) => {
        const target = (event.target as HTMLElement).closest('.item-wrap');
        if (!target) return;
        const rect = target.getBoundingClientRect() as DOMRect;
        this.setState({
            dragIndex: index,
            dragToIndex: index,
            dragTab: tab,
            dragPosition: {
                x: rect.x,
                y: rect.y,
                h: rect.height,
                w: rect.width
            }
        })
        this.downX = event.pageX;
        this.downY = event.pageY;

        this.bakPosition.x = rect.x;
        this.bakPosition.y = rect.y;

        document.addEventListener("mousemove", this.drag);
        document.addEventListener("mouseleave", this.dragEnd);
        document.addEventListener("mouseup", this.dragEnd);
    }

    drag = (event: MouseEvent) => {
        this.setState({
            dragging: true
        })
        const pageX = event.pageX;
        const pageY = event.pageY;

        const offsetX = pageX - this.downX;
        const offsetY = pageY - this.downY;

        const dragPosition = { ...this.state.dragPosition }

        dragPosition.x = this.bakPosition.x + offsetX;
        dragPosition.y = this.bakPosition.y + offsetY;
        this.setState({
            dragPosition
        })

        const offsetIndex = Math.round(offsetY / dragPosition.h);

        this.setState({
            dragToIndex: Math.min(
                Math.max(0, this.state.dragIndex + offsetIndex),
                this.props.tabs.length - 1
            )
        });
    }

    dragEnd = (event: MouseEvent) => {
        if (this.state.dragIndex !== this.state.dragToIndex) {
            const { searchKey } = this.state;
            const { tabs, onExchange } = this.props;
            const searchRex = regexWithSearchKey(searchKey)
            const tabList = tabs.filter((tab) => {
                return !searchKey.length || (tab.node.title.match(searchRex)) || tab.type === EWinTabType.WinTabHome;
            })

            const tab = tabList[this.state.dragIndex];
            const toTab = tabList[this.state.dragToIndex];

            if (tab && toTab) {
                onExchange(tab.id, toTab.id);
            }

        }

        this.setState({
            dragging: false,
            dragIndex: -1,
            dragToIndex: -1
        })

        document.removeEventListener("mousemove", this.drag);
        document.removeEventListener("mouseleave", this.dragEnd);
        document.removeEventListener("mouseup", this.dragEnd);
    }

    render() {
        const { searchKey, dragIndex, dragToIndex, dragging, dragTab, dragPosition } = this.state;
        const searchRex = regexWithSearchKey(searchKey)
        const { tabs, activeTabID, onRemove, onSelect, onRemoveAll, onOpen } = this.props;
        const Tabs: React.ReactNode[] = [];
        tabs.forEach((tab, index) => {
            let match;
            if (!searchKey.length || (match = tab.node.title.match(searchRex))) {
                Tabs.push(<div key={tab.id} style={{
                    transform: dragToIndex >= index && dragIndex < index
                        ? `translate(0px, -${dragPosition.h}px)`
                        : dragToIndex <= index && dragIndex > index
                            ? `translate(0px, ${dragPosition.h}px)`
                            : ``
                }} className={['item-wrap', dragging ? ' item-wrap--dragging' : '', dragging && dragIndex === index ? ' item-wrap--dragging-target' : ''].join('')} onMouseDown={(event) => this.onDragStart(event, index, tab)}><WinOpenedListItem match={match} node={tab.node} wrapClassName={activeTabID === tab.id ? 'active' : ''} onRemove={() => { onRemove(tab.id) }} onSelect={() => { onSelect(tab.id) }} /></div>)
            }
        })
        const root = factory;
        return (
            <div className='win-opened-list-wrapper'>
                <div className='win-opened-list-main'>
                    <DocsSearchBar onOpen={onOpen} root={root}>
                        <div className={["win-opened-list"].join('')}>
                            {/* <div className="win-opened-list-header">
                            <Search placeholder={i18n.t("repo.searchDocuments")} onSearch={this.onSearch} onChange={this.onSearchTextChange} />
                        </div> */}

                            <div className="win-opened-list-body">
                                {!Tabs.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                                    <span>
                                        {searchKey.length ? i18n.t("repo.searchNoData") : i18n.t("repo.noOpenedDocs")}
                                    </span>
                                } />}
                                {Tabs}
                                {dragging && !!dragTab && <div key={dragTab.id + '_'} style={{ width: `${dragPosition.w}px`, left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }} className={['item-wrap--drag'].join(' ')}><WinOpenedListItem match={dragTab.node.title.match(searchRex) || undefined} node={dragTab.node} wrapClassName={activeTabID === dragTab.id ? 'active' : ''} onRemove={() => { onRemove(dragTab.id) }} onSelect={() => { onSelect(dragTab.id) }} /></div>}
                            </div>
                        </div>
                    </DocsSearchBar>
                </div>
                <div className='win-opened-list-footer' onClick={onRemoveAll}>
                    <ClearOutlined />
                    <span>{i18n.t("editor.closeAllDocs")}</span>
                </div>
            </div>
        )
    }
}