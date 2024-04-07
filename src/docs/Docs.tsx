import React, { Component } from "react"
import BarItem from '../widgets/BarItem'
import DocsBar from './DocsBar'
import DocsSearchBar from './DocsSearchBar';
import DocsNodesBar from './DocsNodesBar';
import DocsConfigBar from "./DocsConfigBar";


import { Input, Popover } from 'antd'
import { SearchOutlined, ForkOutlined, PushpinOutlined, RightOutlined, FolderOpenOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import "./Docs.less"
import { EDocsProviderType, IDocsNodeBase, IDocsProvider } from "../types/docs.d"
import sharedScene from "../utils/sharedScene";
import { WithTranslation, withTranslation } from "react-i18next";

enum EDocsSelect {
    EDocsSelectDocs,
    EDocsSelectConfigDocs,
    EDocsSelectSearch,
}


const { Search } = Input;


const configFileIcon = <svg className="anticon anticon-search" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8929" width="1em" height="1em" fill="currentColor"><path d="M595.017 974.043H166.62c-65.609 0-119.003-54.637-119.003-121.782V316.562c0-67.072 53.394-121.783 119.003-121.783h428.398c57.417 0 105.472 41.838 116.59 97.28 15.36-4.388 30.866-7.899 46.592-9.874-15.58-77.531-82.798-136.046-163.182-136.046H342.31c11.117-55.588 59.172-97.426 116.59-97.426h231.13c65.683 0 119.077 54.638 119.077 121.71V280.43c16.092 0.731 31.89 2.925 47.543 6.144V170.423C856.65 76.434 781.97 0 690.103 0H458.97C375.223 0 306.47 63.78 294.766 146.14H166.619C74.752 146.14 0 222.573 0 316.561v535.699c0 93.988 74.752 170.422 166.62 170.422h428.397c72.192 0 133.12-47.542 156.306-113.298a302.592 302.592 0 0 1-46.372-10.752 119.15 119.15 0 0 1-109.934 75.41zM142.775 322.56H459.63v36.571H142.775V322.56z m0 162.377h244.004v36.498H142.775v-36.571z m0 162.377h244.004v36.499H142.775V647.24z m0 162.304H459.63v36.572H142.775v-36.572z m829.147-226.596l43.667-16.457a11.995 11.995 0 0 0 6.875-15.36l-36.352-100.572a11.63 11.63 0 0 0-14.994-7.022l-43.52 16.384c-5.998 2.341-13.312 1.317-16.238-2.194-2.926-3.51-8.997-17.042-6.363-22.894l19.456-43.154a12.069 12.069 0 0 0-5.706-15.799l-95.158-44.91a11.557 11.557 0 0 0-15.434 5.852L788.7 380.05c-2.706 5.925-8.557 10.533-13.019 10.24-4.389-0.292-18.14-5.34-20.334-11.483l-16.091-44.69a11.703 11.703 0 0 0-14.994-7.095l-98.304 37.156a11.995 11.995 0 0 0-6.949 15.36l16.091 44.617c2.195 6.071 1.317 13.605-2.194 16.604-3.364 2.926-16.457 9.216-22.308 6.436l-42.13-19.894a11.557 11.557 0 0 0-15.434 5.851l-43.886 97.426a12.142 12.142 0 0 0 5.632 15.8l42.13 19.894c5.852 2.78 10.314 8.777 10.021 13.166-0.22 4.608-5.266 18.651-11.264 20.919l-43.593 16.457a11.995 11.995 0 0 0-6.875 15.36l36.279 100.644a11.703 11.703 0 0 0 14.92 7.095l43.594-16.457c5.998-2.34 13.385-1.317 16.238 2.194 2.998 3.365 9.07 16.896 6.363 22.894l-19.456 43.008a12.142 12.142 0 0 0 5.705 15.799l95.232 44.983c5.852 2.706 12.8 0.073 15.433-5.852l19.456-43.08c2.633-5.999 8.485-10.533 12.947-10.24 4.388 0.219 18.139 5.339 20.333 11.483l16.092 44.544c2.194 6.144 8.923 9.362 14.92 7.094l98.451-37.083a12.142 12.142 0 0 0 6.876-15.36l-16.092-44.617c-2.194-6.144-1.243-13.605 2.194-16.604 3.438-2.998 16.53-9.216 22.455-6.436l42.057 19.895a11.63 11.63 0 0 0 15.434-5.852l43.885-97.426a12.069 12.069 0 0 0-5.778-15.872l-41.984-19.822c-5.851-2.78-9.801-17.188-9.801-21.65 0-4.535 4.9-10.167 10.971-12.434z m-167.79 120.612a115.931 115.931 0 0 1-149.65-70.583c-22.235-61.732 8.631-130.34 69.047-153.16a115.785 115.785 0 0 1 149.577 70.582c22.236 61.806-8.63 130.414-68.973 153.161z" fill="" p-id="8930"></path></svg>
class Docs extends Component<{
    onActiveNode?: (node: IDocsNodeBase) => void;
    onOpen: (node: IDocsNodeBase) => void;
    root: IDocsNodeBase;
}&WithTranslation, {
    tabSelect: EDocsSelect;
    filterNode: IDocsNodeBase;
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            tabSelect: EDocsSelect.EDocsSelectDocs,
            filterNode: props.root
        }
        if(props.root) {
            sharedScene.getProviderScene(props.root.providerID).then((node)=>{
                if(node) {
                    this.setState({
                        filterNode: node
                    })
                }
            })
        }
    }

    onTabSelect = (tab: EDocsSelect) => {
        this.setState({
            tabSelect: tab
        }, () => {
        })
    }

    onFilterNode = (node: IDocsNodeBase, noCache?: boolean) => {
        this.setState({
            filterNode: node
        })
        if(!node.isLoaded && !node.isLoading) {
            node.load()
        }

        !noCache && sharedScene.setProviderScene(node);
    }

    componentDidMount() {
    }


    render() {
        const { onOpen, root, t } = this.props
        const { tabSelect, filterNode } = this.state;
        const onActiveNode = this.props.onActiveNode;
        const filterFolderTitle = filterNode.title
        const providerType = root.providerType
        const supportConfig = providerType !== EDocsProviderType.EDocsProviderTypeBrowser

        const content =
            (<div className="docs-bar-folder-nodes">
                <DocsNodesBar onlyFolder={true} showRoot={true} root={root} onActiveNode={this.onFilterNode} defaultActiveNode={filterNode} onOpen={onOpen} />
            </div>);
        const toolbar = <Popover placement="rightTop" content={content} trigger="hover">
            <div className="docs-bar-filter" onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }} >
                <PushpinOutlined />
                <div className="docs-bar-filter-title">{filterFolderTitle}</div>
                <RightOutlined />
            </div>
        </Popover>

        return (
            <>
                <div className="docs">
                    <div className="docs-nav">
                        <div className={["docs-nav-before", tabSelect === EDocsSelect.EDocsSelectDocs ? ' active' : ''].join('')}>
                            <div className="docs-nav-item-inner"></div>
                        </div>
                        <div className="docs-nav-inner">
                            <div className={["docs-nav-item", tabSelect === EDocsSelect.EDocsSelectDocs ? ' active' : tabSelect === EDocsSelect.EDocsSelectConfigDocs ? ' before-active' : ''].join('')} onClick={() => { this.onTabSelect(EDocsSelect.EDocsSelectDocs) }}>
                                <div className="docs-nav-item-inner"><FolderOpenOutlined /></div>
                            </div>
                            <div className={["docs-nav-item", tabSelect === EDocsSelect.EDocsSelectConfigDocs ? ' active' :  tabSelect === EDocsSelect.EDocsSelectDocs ? ' after-active' : ' before-active'].join('')} onClick={() => { this.onTabSelect(EDocsSelect.EDocsSelectConfigDocs) }}>
                                <div className="docs-nav-item-inner">{configFileIcon}</div>
                            </div>
                            <div id="app-guide-search" className={["docs-nav-item", tabSelect === EDocsSelect.EDocsSelectSearch ? ' active' : tabSelect === EDocsSelect.EDocsSelectConfigDocs ? ' after-active' : ''].join('')} onClick={() => { this.onTabSelect(EDocsSelect.EDocsSelectSearch) }}>
                                <div className="docs-nav-item-inner"><SearchOutlined /></div>
                            </div>
                        </div>
                        <div className={["docs-nav-after", tabSelect === EDocsSelect.EDocsSelectSearch ? ' active' : ''].join('')}>
                            <div className="docs-nav-item-inner"></div>
                        </div>
                    </div>
                    <div className="docs-tab">
                        <div className="docs-tab__docs" style={{ display: tabSelect !== EDocsSelect.EDocsSelectDocs ? 'none' : 'block' }}>
                            <DocsBar onActiveNode={onActiveNode} onSetFilterNode={this.onFilterNode} onOpen={onOpen} root={filterNode} toolbar={
                                toolbar
                            } />
                        </div>
                        <div className="docs-tab__config" style={{ display: tabSelect !== EDocsSelect.EDocsSelectConfigDocs ? 'none' : 'block' }}>
                            { supportConfig ? <DocsConfigBar onOpen={onOpen} root={root as IDocsProvider} /> : <div className="docs-tab__no-configs"><EyeInvisibleOutlined style={{marginRight: '5px'}}/>{t("repo.noConfigs")}</div>}
                        </div>
                        <div className="docs-tab__search" style={{ display: tabSelect !== EDocsSelect.EDocsSelectSearch ? 'none' : 'block' }}>
                            <DocsSearchBar onOpen={onOpen} root={root} />
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
export default withTranslation()(Docs)