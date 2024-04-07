import React, { Component } from "react"
import { EllipsisOutlined, CloseOutlined, HomeFilled } from '@ant-design/icons'
import { Button, Input, Empty } from 'antd'
import DocsSearchResultItem from './DocsSearchResultItem'
import { throttle } from '../utils/throttle'
import { IDocsNodeBase, IDocsSearchResult } from '../types/docs'
import factory from './docsprovider/DocsProviderFactory'
import './DocsSearchBar.less'
import { WithTranslation, withTranslation } from "react-i18next"
import { regexWithSearchKey } from "../utils/utils"
const { Search } = Input;

class DocsSearchBar extends Component<{
    onOpen: (node: IDocsNodeBase) => void;
    root?: IDocsNodeBase;
} & WithTranslation, {
    searchKey: string;
    searchLoading: boolean;
    searchResults: IDocsSearchResult[];
}>{

    onSearchTextChangeProxy!: Function;
    searchResultsCache!: IDocsSearchResult[];
    constructor(props: any) {
        super(props);
        this.state = {
            searchKey: '',
            searchLoading: false,
            searchResults: []
        }

        this.onSearchTextChangeProxy = throttle(this.onSearch, 200);
    }

    onSearch = (key: string) => {
        this.setState({
            searchKey: key,
            searchLoading: true
        })

        if (key) {
            const root = this.props.root || factory;
            root.find(regexWithSearchKey(key)).then((results) => {
                this.setState({
                    searchResults: results,
                    searchLoading: false
                })
            })
        } else {
            this.setState({
                searchResults: [],
                searchLoading: false
            })
        }
    }

    onSearchTextChange = (event: React.ChangeEvent) => {
        const key = (event.target as HTMLInputElement).value;
        this.onSearchTextChangeProxy(key);
    }

    render() {

        const { onOpen, t, children } = this.props;
        const { searchLoading, searchResults, searchKey } = this.state;

        const Results = searchResults.map((result) => {
            return <DocsSearchResultItem result={result} onOpen={onOpen} key={result.node.tempID} />
        })
        return (
            <div className="docs-search-bar">
                <div className="docs-search-bar-header">
                    <Search loading={searchLoading} onChange={this.onSearchTextChange} placeholder={t("repo.searchDocuments")} onSearch={this.onSearch} />
                </div>
                <div className={["docs-search-bar-children", children && !searchKey ? " docs-search-bar-children--show" : ""].join("")}>
                    {children}
                </div>
                <div className={["docs-search-bar-body", !children || searchKey ? " docs-search-bar-body--show" : ""].join("")}>
                    {!searchLoading && searchKey.length && !searchResults.length ?
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
export default withTranslation()(DocsSearchBar)