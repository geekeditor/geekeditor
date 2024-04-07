import React, { Component } from "react"
import BarItem from '../widgets/BarItem'
import { FileAddOutlined, QuestionCircleOutlined, PushpinOutlined, PushpinFilled, CopyOutlined, SettingOutlined, DesktopOutlined, SisternodeOutlined, GithubFilled, GitlabFilled, ForkOutlined, FileImageOutlined, FolderFilled } from '@ant-design/icons'
import "./AppSideBar.less"
import AppQRCode from './AppQRCode'
import { EDocsNodeChangeType, EDocsProviderType, IDocsNodeBase } from "../types/docs.d"
import sharedEventBus from '../utils/sharedEventBus'
import factory from "../docs/docsprovider/DocsProviderFactory";
import sharedScene from "../utils/sharedScene"
import { Select } from "antd"
import sharedPreferences from "../utils/sharedPreferences"
import { getProviderTypeIcon } from "../docs/DocsProviderIcons"



export default class AppSideBarProviders extends Component<{
    onSelect: (provider: string) => void;
    providerSelect: string;
}, {

    }> {

    constructor(props: any) {
        super(props);
        this.state = {
        }
    }

    onSelectProvider = async (providerID: string) => {
        // const providerID = provider.providerID;

        const lastProviderSelect = this.props.providerSelect;

        this.props.onSelect(providerID);
        const nodeScene = await sharedScene.getProviderScene(providerID);
        factory.selectedProvider = providerID;
        const provider = factory.getProvider(providerID);

        if(provider?.providerType === EDocsProviderType.EDocsProviderTypeFSA && !lastProviderSelect) {
            // First load
            return;
        }

        if (nodeScene) {
            if(!nodeScene.isLoaded) {
                nodeScene.load();
            }
        } else {
            // Load provider
            if(provider && !provider.isLoaded){
                provider.load()
            }
        }
    }

    onNodeChanged = (type: EDocsNodeChangeType) => {
        if (type === EDocsNodeChangeType.EDocsNodeChangeTypeChildren) {
            const children = factory.children;
            const { providerSelect, onSelect } = this.props;
            const index = children.findIndex((p) => p.providerID === providerSelect);
            if (index === -1) {
                this.onSetDefaultProvider()
            }
            this.forceUpdate()
        }
    }

    onSetDefaultProvider = () => {

        const children = factory.children;
        if(children.length) {
            this.onSelectProvider(factory.selectedProvider)
        }

    }

    componentWillUnmount() {
        factory.offChanged(this.onNodeChanged);
        sharedPreferences.off('doc_providers', this.onSetDefaultProvider);
    }

    componentDidMount() {
        factory.onChanged(this.onNodeChanged);
        this.onSetDefaultProvider()
        sharedPreferences.on('doc_providers', this.onSetDefaultProvider);
    }


    render() {
        const { providerSelect } = this.props;
        const root = factory;
        const children = root.children;

        // const BarItems = children.map((provider) => {
        //     const providerID = provider.providerID;
        //     const type = provider.providerType;
        //     const icon = getProviderTypeIcon(type);
        //     return <BarItem key={providerID} icon={icon} tip={provider.title} placement="right" wrapClassName="app-bar-item" onClick={() => { this.onSelectProvider(provider) }} selected={providerSelect === providerID} />
        // })

        const Options = children.map((provider)=>{
            const providerID = provider.providerID;
            const type = provider.providerType;
            const icon = getProviderTypeIcon(type);
            return <Select.Option key={providerID} value={providerID}>{icon}<span className="app-provider-title" style={{marginLeft: '5px'}}>{provider.title}</span></Select.Option>
        })



        return (
            <>
                <Select
                    style={{ maxWidth: 150 }}
                    bordered={false}
                    onChange={this.onSelectProvider}
                    value={providerSelect}
                    className="app-providers"
                >

                    {Options}
                </Select>
                {/* {BarItems} */}
            </>
        )
    }
}