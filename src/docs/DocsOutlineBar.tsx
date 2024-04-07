import React, { Component } from "react"
import { EllipsisOutlined, CloseOutlined, HomeFilled } from '@ant-design/icons'
import { Button, Input, Empty } from 'antd'
import DocsSearchResultItem from './DocsSearchResultItem'
import { throttle } from '../utils/throttle'
import { EDocsNodeChangeType, IDocsNodeBase, IDocsSearchResult } from '../types/docs.d'
import { MEOutlineItem } from "@geekeditor/meditable/dist/types/types/index.d";
import { filterOutline } from "@geekeditor/meditable";
import './DocsOutlineBar.less'
import { WithTranslation, withTranslation } from "react-i18next"
const { Search } = Input;

class DocsOutlineBar extends Component<{
    node: IDocsNodeBase;
} & WithTranslation, {
    searchKey: string;
    searchLoading: boolean;
    activeOutlineId: string|undefined;
    outlines: MEOutlineItem[];
}>{

    onSearchTextChangeProxy!:Function;
    searchResultsCache!: IDocsSearchResult[];
    constructor(props: any) {
        super(props);
        const outlines = this.filterOutlines();
        const activeOutlineId = this.findActiveOutlineId();
        this.state = {
            searchKey: '',
            searchLoading: false,
            activeOutlineId,
            outlines
        }
        
        this.onSearchTextChangeProxy = throttle(this.onSearch, 200);
        this.searchResultsCache = []
    }

    findActiveOutlineId = () => {
        let outlines = this.props.node.outlines || [];
        let originalActiveOutlineId = this.props.node.activeOutlineId;
        let activeOutlineId;
        for(let i = 0; i < outlines.length; i++) {
            const outline = outlines[i];
            if(/heading\d/.test(outline.type)) {
                activeOutlineId = outline.id
            }

            if(outline.id === originalActiveOutlineId || !originalActiveOutlineId) {
                break;
            }
        }
        return activeOutlineId;
    }

    filterOutlines = (filterKey?: string) => {
        let outlines = this.props.node.outlines || [];
        outlines = filterOutline(outlines, {filterKey, filterTypeRegex: /heading\d/})
        return outlines;
    }

    onSearch = (key: string) => {
        let outlines = this.filterOutlines(key);
        this.setState({
            searchKey: key,
            outlines
        })
    }

    onSearchTextChange = (event: React.ChangeEvent) => {
        const key = (event.target as HTMLInputElement).value;
        this.onSearchTextChangeProxy(key);
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if(type === EDocsNodeChangeType.EDocsNodeChangeTypeOutline) {
            const activeOutlineId = this.findActiveOutlineId();
            this.setState({
                activeOutlineId
            })
        } else if(type === EDocsNodeChangeType.EDocsNodeChangeTypeContent) {
            const outlines = this.filterOutlines(this.state.searchKey);
            const activeOutlineId = this.findActiveOutlineId();
            this.setState({
                outlines,
                activeOutlineId
            })
        }
    }

    scrollOutlineIntoView = (id: string) => {
        if(this.props.node.scrollOutlineIntoView) {
            this.props.node.scrollOutlineIntoView(id)
        }
    }

    componentDidMount() {
        const { node } = this.props;
        node.onChanged(this.onNodeChanged);
    }

    componentWillUnmount() {
        const { node } = this.props;
        node.offChanged(this.onNodeChanged);
    }

    componentDidUpdate(prevProps: Readonly<{ node: IDocsNodeBase; }>): void {
        if(prevProps.node !== this.props.node) {
            prevProps.node.offChanged(this.onNodeChanged);
            this.props.node.onChanged(this.onNodeChanged);
            
            const outlines = this.filterOutlines();
            const activeOutlineId = this.findActiveOutlineId();
            this.setState({
                outlines,
                activeOutlineId,
                searchKey: ""
            })

        }
    }

    render() {

        const {t} = this.props;
        const {searchLoading, outlines, searchKey, activeOutlineId} = this.state;

        const Results = outlines.map(({text, match, id, type})=>{
            const title = !match ? text : match.map((words: string, index: number) => {
                if (index == 0 || !words.length) return undefined;
                if (index % 2 == 0) {
                    return <em key={index} className="search-mark">{words}</em>
                } else {
                    return <span key={index}>{words}</span>
                }
            });

            return <div onClick={()=>this.scrollOutlineIntoView(id)} key={id} className={["docs-outline-item", id===activeOutlineId ? "docs-outline-item--active" : "", type ].join(" ")}>{title}</div>
        })
        return (
            <div className="docs-outline-bar">
                <div className="docs-outline-bar-header">
                    <Search loading={searchLoading} onChange={this.onSearchTextChange} placeholder={t("repo.searchOutline")} onSearch={this.onSearch} />
                </div>
                <div className={["docs-outline-bar-body"].join("")}>
                    {searchKey.length && !outlines.length ?
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                            <span>
                                {t("repo.searchNoData")}
                            </span>
                        } /> : <></>}
                    {Results}
                </div>
            </div>
        )
    }
}
export default withTranslation()(DocsOutlineBar)