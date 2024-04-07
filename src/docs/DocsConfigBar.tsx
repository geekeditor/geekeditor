import React, { Component } from "react"
import BarItem from "../widgets/BarItem"
import { Divider, Dropdown, Empty, Menu, Popover } from "antd"
import { NodeExpandOutlined, NodeCollapseOutlined, SisternodeOutlined, FileAddOutlined, FolderAddOutlined, ReloadOutlined, LoadingOutlined, FilterOutlined, PushpinOutlined, DownOutlined, FileMarkdownOutlined } from "@ant-design/icons"
import "./DocsConfigBar.less"
import { EDocsNodeChangeType, EDocsNodeType, EDocsProviderType, IDocsNodeBase, IDocsNodeData, IDocsProvider } from "../types/docs.d"
import { WithTranslation, withTranslation } from "react-i18next"
import MenuItem from "../widgets/MenuItem"
import DocsConfigNode from "./DocsConfigNode"
import { DocsifyCoverPage, DocsifyIndex, DocsifyNavbar, DocsifyReadme, DocsifySideBar } from "./DocsConfigs"

// const HtmlIcon = <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19967" width="20" height="20"><path d="M434.12811 654.18527l-16.884181 16.884181c-4.707105 4.707105-12.279404 4.707105-16.884181 0l-118.496253-118.496253c-4.707105-4.707105-4.707105-12.279404 0-16.884181l118.496253-118.496253c4.707105-4.707105 12.279404-4.707105 16.884181 0l16.884181 16.884181c4.707105 4.707105 4.707105 12.279404 0 16.884181l-93.118817 93.118817 93.118817 93.118817C438.835215 642.008194 438.835215 649.580494 434.12811 654.18527zM473.115219 744.848206l-21.591286-6.037374c-5.935045-1.637254-9.618867-7.572299-8.18627-13.20036l96.188668-369.917058c1.534926-5.730389 7.981613-9.004897 14.325972-7.265314l23.126212 6.242031c6.344359 1.739582 10.335165 7.776956 8.80024 13.507345l-99.258519 369.610073C485.087639 743.313281 479.050265 746.48546 473.115219 744.848206zM749.401819 552.675527l-118.496253 118.496253c-4.707105 4.707105-12.279404 4.707105-16.884181 0l-16.884181-16.884181c-4.707105-4.707105-4.707105-12.279404 0-16.884181l93.118817-93.118817-93.118817-93.118817c-4.707105-4.707105-4.707105-12.279404 0-16.884181l16.884181-16.884181c4.707105-4.707105 12.279404-4.707105 16.884181 0l118.496253 118.496253C754.006595 540.396123 754.006595 547.968422 749.401819 552.675527zM823.794544 919.522734l-628.500849 0 0-814.533826 455.668232 0 0 128.012791c0 16.065554 14.121315 29.061257 31.41481 29.061257L823.794544 262.062956 823.794544 919.522734 823.794544 919.522734zM722.080144 145.203957l59.759768 58.634156-59.759768 0L722.080144 145.203957zM886.624163 231.364445c0-0.102328 0-0.102328 0-0.204657 0-0.61397-0.102328-1.22794-0.204657-1.841911 0-0.102328 0-0.204657 0-0.306985-0.409313-2.865194-1.22794-5.525732-2.455881-7.981613l0 0c-0.61397-1.22794-1.330269-2.455881-2.046567-3.581493-0.102328-0.102328-0.204657-0.204657-0.204657-0.409313-0.306985-0.511642-0.716299-0.920955-1.023284-1.432597-0.102328-0.204657-0.306985-0.306985-0.409313-0.511642-0.306985-0.306985-0.511642-0.61397-0.818627-1.023284-0.204657-0.204657-0.409313-0.511642-0.61397-0.716299-0.204657-0.204657-0.409313-0.409313-0.61397-0.61397-0.204657-0.204657-0.409313-0.409313-0.716299-0.716299l-171.40002-156.767063c-4.809433-4.604777-11.358449-7.674628-18.521435-8.493255 0 0 0 0-0.102328 0-0.716299-0.102328-1.432597-0.102328-2.148896-0.204657-0.204657 0-0.306985 0-0.511642 0-0.306985 0-0.61397 0-1.023284 0l-515.223344 0c-17.293495 0-31.210153 12.995703-31.210153 29.061257l0 872.758669c0 16.065554 14.018987 29.061257 31.210153 29.061257l686.82802 0c17.293495 0 31.210153-12.995703 31.210153-29.061257l0-715.684621C886.624163 232.490057 886.624163 231.876087 886.624163 231.364445z" fill="currentColor" p-id="19968"></path></svg>
// const JSIcon = <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="23729" width="20" height="20"><path d="M173.320441 64.959477l0 17.833157 0 855.984379 0 17.833157 17.833157 0 641.98854 0 17.833157 0 0-17.833157L850.975295 332.454788l0-7.245008-5.015224-5.572926L596.296895 69.975724l-5.572926-5.015224-7.245008 0L191.153598 64.960501 173.320441 64.960501zM208.986755 100.625792l356.660072 0L565.646827 332.454788l0 17.833157 17.833157 0 231.828996 0 0 570.655911L208.986755 920.943856 208.986755 100.625792zM601.312118 126.260635l188.360995 188.360995L601.312118 314.621631 601.312118 126.260635zM339.249541 648.4016c12.279674 21.284769 27.424606 30.289863 46.662763 30.289863 28.652574 0 42.977837-16.372899 42.977837-57.305147L428.89014 435.147658l33.973766 0 0 189.513238c0 46.252417-21.284769 83.910085-74.086345 83.910085-33.972742 0-58.122769-14.734586-73.677023-42.977837L339.249541 648.4016zM534.087041 645.12702c19.238157 20.056801 45.844118 33.564443 74.086345 33.564443 35.20071 0 56.076156-17.600867 56.076156-43.797505 0-27.424606-19.646456-36.019355-45.024449-47.480384l-38.476313-16.781198c-24.967648-10.642384-54.438866-29.880541-54.438866-69.175499 0-40.931225 36.019355-71.221088 84.72873-71.221088 31.92613 0 60.169381 13.507642 78.998215 33.154098l-18.010189 22.103414c-16.372899-15.553231-36.429701-25.377994-60.989049-25.377994-30.289863 0-50.345642 15.144932-50.345642 39.293935 0 25.787316 23.73968 35.611056 44.61615 44.61615l38.476313 16.372899c31.107485 13.507642 55.257511 31.92613 55.257511 71.630411 0 42.569538-35.20071 76.54228-91.687212 76.54228-37.657668 0-70.402443-15.553231-93.733824-39.703257L534.087041 645.12702z" fill="currentColor" p-id="23730"></path></svg>
// const DocsifyIcon = <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4297" width="20" height="20"><path d="M512 122.112c-282.325333 0-512 229.674667-512 512 0 83.797333 20.906667 145.322667 64 188.074667 72.789333 72.362667 197.077333 79.701333 343.466667 79.701333 18.346667 0 37.12-0.085333 56.106666-0.213333a9284.266667 9284.266667 0 0 1 117.973334 0c161.792 1.024 301.482667 1.877333 378.88-75.008C1003.136 784.128 1024 721.066667 1024 634.112c0-282.325333-229.674667-512-512-512z m-377.685333 347.904a16.768 16.768 0 1 1 0-33.578667 16.768 16.768 0 0 1 0 33.578667zM218.154667 361.813333c-23.466667 27.178667-43.093333 58.069333-43.093334 58.069334-2.56 3.925333-7.125333 4.224-10.24 0.725333l-11.093333-12.373333a10.709333 10.709333 0 0 1-0.853333-12.928s47.36-66.517333 77.056-93.269334c10.666667-9.6 10.581333-10.197333 38.016-29.525333 27.434667-19.328 59.733333-35.242667 59.733333-35.242667a11.605333 11.605333 0 0 1 13.141333 2.517334l11.093334 12.373333c3.2 3.498667 2.389333 7.936-1.706667 10.026667 0 0-75.605333 37.845333-100.394667 64.384-16.810667 18.005333-8.192 8.106667-31.658666 35.242666z m67.242666 91.434667a58.752 58.752 0 1 1 117.504 0 58.752 58.752 0 0 1-117.504 0z m230.826667 338.304c-81.152 0-146.901333-65.792-146.901333-146.901333s70.144-36.437333 151.253333-36.437334 142.506667-44.672 142.506667 36.437334-65.749333 146.901333-146.901334 146.901333zM713.386667 512a58.752 58.752 0 1 1 0-117.504 58.752 58.752 0 0 1 0 117.504z" fill="#2ECE53" p-id="4298"></path></svg>
// const CssIcon = <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17264" width="18" height="18"><path d="M943.48 682.144c52.12 8.56 78.52 29.76 78.52 63.072 0 35.808-37.424 63.872-85.2 63.872-45.28 0-81.808-25.424-85.04-59.144a21.304 21.304 0 0 1 19.16-23.208c11.536-1.28 22.136 7.448 23.248 19.16 0.808 8.6 17.416 20.608 42.624 20.608 25.64 0 42.632-12.816 42.632-21.288 0-6.392-7.456-15.248-42.84-21.08l-2.808-22.064-3.408 20.992c-52.256-8.512-78.696-29.72-78.696-63.064 0-35.808 37.432-63.872 85.208-63.872 45.264 0 81.808 25.424 85.04 59.144a21.304 21.304 0 0 1-19.16 23.208c-11.28 1.576-22.104-7.408-23.256-19.16-0.8-8.6-17.416-20.56-42.624-20.56-25.632 0-42.624 12.808-42.624 21.28 0 5.24 5.576 14.952 42.92 21.04l6.304 1.064z m-212.96 0c52.12 8.56 78.52 29.76 78.52 63.072 0 35.808-37.424 63.872-85.2 63.872-45.28 0-81.808-25.424-85.04-59.144a21.304 21.304 0 0 1 19.16-23.208c11.624-1.28 22.096 7.448 23.248 19.16 0.808 8.6 17.416 20.608 42.624 20.608 25.64 0 42.632-12.816 42.632-21.288 0-6.392-7.456-15.248-42.8-21.08l-2.848-22.064-3.408 20.992c-52.256-8.512-78.696-29.72-78.696-63.064 0-35.808 37.432-63.872 85.208-63.872 45.264 0 81.808 25.424 85.04 59.144a21.304 21.304 0 0 1-19.16 23.208c-11.416 1.576-22.104-7.408-23.256-19.16-0.8-8.56-17.416-20.56-42.624-20.56-25.632 0-42.624 12.808-42.624 21.28 0 5.24 5.576 14.952 42.92 21.04l6.304 1.064zM574.88 723.92a21.304 21.304 0 0 1 21.288 21.296c0 35.216-28.656 63.872-63.872 63.872h-42.584c-35.216 0-63.872-28.656-63.872-63.872V660.048c0-35.224 28.656-63.88 63.872-63.88h42.584c35.216 0 63.872 28.656 63.872 63.88a21.304 21.304 0 0 1-42.584 0 21.328 21.328 0 0 0-21.288-21.296h-42.584a21.328 21.328 0 0 0-21.296 21.296v85.168a21.328 21.328 0 0 0 21.296 21.288h42.584a21.328 21.328 0 0 0 21.288-21.288 21.304 21.304 0 0 1 21.296-21.296zM745.2 553.584a21.304 21.304 0 0 1-21.288-21.288V42.584H298.08V276.8a21.304 21.304 0 0 1-21.288 21.296H42.584v681.336H723.92V872.96a21.304 21.304 0 0 1 42.584 0v127.76a21.304 21.304 0 0 1-21.288 21.28H21.296A21.304 21.304 0 0 1 0 1000.72V276.8c0-2.856 0.6-5.624 1.656-8.224 0.512-1.28 1.496-2.264 2.264-3.408 0.76-1.152 1.312-2.472 2.296-3.448L261.72 6.216c1.36-1.32 3.064-2.168 4.68-3.112 0.72-0.464 1.32-1.104 2.128-1.44C271.128 0.6 273.896 0 276.8 0h468.416a21.304 21.304 0 0 1 21.296 21.296v511a21.304 21.304 0 0 1-21.296 21.288z m-489.704-298.08V72.696L72.688 255.496h182.816z" fill="currentColor" p-id="17265"></path></svg>

function needDocsifyConfigFiles(children: IDocsNodeBase[]) {
    const files: IDocsNodeData[] = []

    if(!children.find((n)=>n.title==="index"&&n.extension===".html")) {
        files.push({
            title: "index",
            extension: ".html",
            content: DocsifyIndex
        })
    }

    if(!children.find((n)=>n.title===""&&n.extension===".nojekyll")) {
        files.push({
            title: "",
            extension: ".nojekyll",
            content: "\n"
        })
    }

    if(!children.find((n)=>n.title==="README"&&n.extension===".md")) {
        files.push({
            title: "README",
            extension: ".md",
            content: DocsifyReadme
        })
    }

    if(!children.find((n)=>n.title==="_sidebar"&&n.extension===".md")) {
        files.push({
            title: "_sidebar",
            extension: ".md",
            content: DocsifySideBar
        })
    }

    if(!children.find((n)=>n.title==="_navbar"&&n.extension===".md")) {
        files.push({
            title: "_navbar",
            extension: ".md",
            content: DocsifyNavbar
        })
    }

    if(!children.find((n)=>n.title==="_coverpage"&&n.extension===".md")) {
        files.push({
            title: "_coverpage",
            extension: ".md",
            content: DocsifyCoverPage
        })
    }


    return files;
}

class DocsConfigBar extends Component<{
    root: IDocsProvider;
    onOpen: (node: IDocsNodeBase) => void;
}&WithTranslation, {
    activeNode: IDocsNodeBase|undefined;
    menuOpened: boolean;
}>{

    constructor(props: any) {
        super(props)
        this.state = {
            activeNode: undefined,
            menuOpened: false
        }
    }

    onCreateConfigWithExtension = (extension: string) => {
        const { root } = this.props;
        root.trigger("createConfig", {extension});
        this.setState({
            menuOpened: false
        })
    }

    onCreateConfigFixed = (fixedType: string) => {
        const { root } = this.props;
        let files: IDocsNodeData[] = []
        if(fixedType === "readme") {
            files.push({
                title: "README",
                extension: ".md",
                content: DocsifyReadme
            })
        } else if(fixedType === "docsify") {
            files = needDocsifyConfigFiles(root.configs||[])
        }
        root.trigger("createConfig", {fixedType, files});
        this.setState({
            menuOpened: false
        })
    }

    onReload = () => {
        const { root } = this.props;
        root.queryConfigs().then((success) => {
        })
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeConfigsLoading ||
            type === EDocsNodeChangeType.EDocsNodeChangeTypeConfigs) {
            this.forceUpdate()
        }
    }

    onAddMenuClick = (e: any) => {
        e.domEvent.stopPropagation();
    }

    onActiveNode = (node: IDocsNodeBase) => {
        this.setState({
            activeNode: node
        })
    }

    onOpenChange = (visiable: boolean) => {
        this.setState({
            menuOpened: visiable
        })
    }

    componentWillUnmount() {
        const { root } = this.props;
        root.offChanged(this.onNodeChanged);
    }

    componentDidMount() {
        const { root } = this.props;
        root.onChanged(this.onNodeChanged);

        if(!root.isConfigsLoaded && root.providerType !== EDocsProviderType.EDocsProviderTypeFSA) {
            this.onReload();
        }
    }

    componentDidUpdate(prevProps:any) {
        if(prevProps.root !== this.props.root) {
            if(prevProps.root) {
                prevProps.root.offChanged(this.onNodeChanged);
            }
            
            this.props.root.onChanged(this.onNodeChanged);
        }
    }

    render() {
        const { onOpen, t} = this.props;
        const { root } = this.props;
        const { activeNode, menuOpened } = this.state;
        const isLoading = root.isConfigsLoading;
        const loaded = root.isConfigsLoaded;
        const children = root.configs || [];
        const readmeDisabled = !!children.find((n)=>n.title.toLowerCase()==="readme" && (n.extension||"") === ".md")
        const docsifyDisabled = !needDocsifyConfigFiles(children).length

        const newFilesMenus =
        (<div className="close-nodes">
            <MenuItem name="Markdown(.md)" icon={null} onClick={()=>this.onCreateConfigWithExtension(".md")}/>
            <MenuItem name="HTML(.html)" icon={null} onClick={()=>this.onCreateConfigWithExtension(".html")}/>
            <MenuItem name="Javascript(.js)" icon={null} onClick={()=>this.onCreateConfigWithExtension(".js")}/>
            <MenuItem name="StyleSheet(.css)" icon={null} onClick={()=>this.onCreateConfigWithExtension(".css")}/>
            <Divider plain className="ge-menu-divider"></Divider>
            <MenuItem disabled={readmeDisabled} name="README.md" icon={null} onClick={()=>this.onCreateConfigFixed("readme")}/>
            <MenuItem disabled={docsifyDisabled} name={t("repo.docsifyConfigFiles")} icon={null} onClick={()=>this.onCreateConfigFixed("docsify")}/>
        </div>);

        return (
            <>
                <div className="docs-config-bar">
                    <div className="docs-config-bar-header">
                        <div className="docs-config-bar-ops">
                        </div>
                        <div className="docs-config-bar-ops">
                            <Popover placement="bottom" title={null} content={newFilesMenus} trigger={["click"]} open={menuOpened} onOpenChange={this.onOpenChange}>
                                <BarItem disabled={isLoading} icon={<FileAddOutlined />} />
                            </Popover>
                            <BarItem disabled={isLoading} onClick={this.onReload} icon={isLoading ? <LoadingOutlined /> : <ReloadOutlined />} />
                        </div>
                    </div>                   
                    {!isLoading && !loaded && <div className="docs-config-bar-unloaded">{t("repo.noLoad")}<span onClick={this.onReload}>{t("common.refresh")}</span></div>}
                    <DocsConfigNode noHeader={true} hideOps={false} key={root.tempID} node={root} activeNode={activeNode} onActiveNode={this.onActiveNode} onOpen={onOpen}/>
                </div>
            </>
        )
    }
}

export default withTranslation()(DocsConfigBar)