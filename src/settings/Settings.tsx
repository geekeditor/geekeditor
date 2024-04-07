import React, { Component } from "react"
import ReactDOM from 'react-dom'
import './Settings.less'
import sharedPreferences from '../utils/sharedPreferences';
import DocsProviderAdd from '../docs/DocsProviderAdd'
import SettingsDocProvider from './SettingsDocProvider'
import { docs, hostings } from '../docs/platform'
import TransitionModal from '../widgets/TransitionModal'
// import AppUpdate from "../app/AppUpdate";

import { Button, Menu, Tooltip } from 'antd'
import { SisternodeOutlined, SettingOutlined, GithubOutlined, ForkOutlined, PlusCircleOutlined, EyeOutlined, EyeInvisibleOutlined, SyncOutlined, ExportOutlined, CloudUploadOutlined, CloudDownloadOutlined, ImportOutlined } from '@ant-design/icons';
import { EPlatformType } from "../types/platform.d";
import { IDocsProviderSettingInfo } from "../types/docs";
import { version } from "../version";
import SettingsExport from "./SettingsExport";
import SettingsImport from "./SettingsImport";
import SettingsBackup from "./SettingsBackup";
import SettingsLoad from "./SettingsLoad";
import SettingsClear from "./SettingsClear";
import i18n from "../i18n";
const { SubMenu } = Menu;

export default class Settings extends Component<{
    key?: string
}, {
    selectedKey: string;
    defaultSelectedKeys: string[];
    defaultOpenKeys: string[];
    hideBuiltinProvider: boolean;
}> {

    static newInstance(props?: any) {
        props = props || {}
        const div = document.createElement('div');
        document.body.appendChild(div);
        const settings = ReactDOM.render(React.createElement(Settings, props), div);

        return {

            open(options?: { key?: string }) {
                settings.show(options);
            },

            close() {
                settings.hide();
            },

            destroy() {
                ReactDOM.unmountComponentAtNode(div);
                document.body.removeChild(div);
            }
        }
    }

    private transitionModal!: TransitionModal | null;
    private provider!: DocsProviderAdd | null;
    // private update!: AppUpdate | null;
    constructor(props: any) {
        super(props);
        this.state = {
            selectedKey: props.key || 'docProviders',
            defaultSelectedKeys: [props.key || 'docProviders'],
            defaultOpenKeys: [],
            hideBuiltinProvider: !!sharedPreferences.getSetting('hide_builtin_provider')
        }


    }

    show(options?: { key?: string }) {

        options = options || {}
        let selKey = options.key;
        const sortedProviders = this.sortedProviders()

        if (!selKey && sortedProviders.length) {
            selKey = sortedProviders[0].id;
        } else {
            selKey = 'docProviders'
        }

        this.setState({
            selectedKey: selKey,
            defaultSelectedKeys: [selKey],
            defaultOpenKeys: ['docProviders'],
        })
        if (this.transitionModal) {
            this.transitionModal.showTransition();
        }
    }

    hide() {
        if (this.transitionModal) {
            this.transitionModal.hideTransition();
        }
    }

    onOk = () => {
        this.hide()
    }

    onSelect = (e: any) => {
        this.setState({
            selectedKey: e.key
        })
    }

    onAddDocRepo = () => {
        if (this.provider) {
            this.provider.show();
        }
    }

    onCheckUpdate = () => {
        // if (this.update) {
        //     this.update.checkUpdate();
        // }
    }

    onTriggerBuiltinProvider = () => {

        console.log(sharedPreferences.getSetting('hide_builtin_provider'))
        const hideBuiltinProvider = !!sharedPreferences.getSetting('hide_builtin_provider');
        this.setState({
            hideBuiltinProvider: !hideBuiltinProvider
        }, () => {
            sharedPreferences.setSetting('hide_builtin_provider', !hideBuiltinProvider);
        })


    }

    sortedProviders() {
        const providers: IDocsProviderSettingInfo[] = sharedPreferences.getSetting('doc_providers') || []
        const sortedProviders = providers.sort((a, b) => {
            return a.doc_repo.platform - b.doc_repo.platform;
        }).filter((p) => !!docs[p.doc_repo.platform])
        return sortedProviders;
    }

    updateBuiltinProviderState() {
        const hideBuiltinProvider = !!sharedPreferences.getSetting('hide_builtin_provider');
        this.setState({
            hideBuiltinProvider: hideBuiltinProvider
        }, () => {
        })
    }

    onForceUpdate = () => {
        this.forceUpdate()
    }

    onUpdateBuiltinProviderState = () => {
        this.updateBuiltinProviderState()
    }

    componentWillUnmount() {
        sharedPreferences.off(['doc_providers'], this.onForceUpdate);
        sharedPreferences.off(['hide_builtin_provider'], this.onUpdateBuiltinProviderState);
    }

    componentDidMount() {
        sharedPreferences.on(['doc_providers'], this.onForceUpdate);
        sharedPreferences.on(['hide_builtin_provider'], this.onUpdateBuiltinProviderState);

        this.updateBuiltinProviderState();
    }


    render() {
        const { selectedKey, defaultSelectedKeys, defaultOpenKeys, hideBuiltinProvider } = this.state;
        let Body = undefined;
        const sortedProviders = this.sortedProviders()
        const Items = sortedProviders.map((provider, index) => {

            if (provider.id === selectedKey) {
                Body = <SettingsDocProvider key={provider.id} provider={provider} />
            }

            const platformName = docs[provider.doc_repo.platform].name.split('（')[0]
            return <Menu.Item key={provider.id} icon={provider.doc_repo.platform === EPlatformType.EPlatformTypeGithub ? <GithubOutlined /> : <ForkOutlined />} >{provider.title || platformName}</Menu.Item>
        })
        return (
            <div className="settings">
                <TransitionModal
                    ref={(modal) => { this.transitionModal = modal }}
                    title={<>
                        <div>
                            <SettingOutlined /><span style={{ marginLeft: '5px' }}>{i18n.t("common.setting")}</span>
                            <Button type="text" icon={<PlusCircleOutlined />} onClick={this.onAddDocRepo}>{i18n.t("settings.addRepository")}</Button>
                            {/* <Button type="text" icon={hideBuiltinProvider ? <EyeOutlined /> : <EyeInvisibleOutlined />} onClick={this.onTriggerBuiltinProvider}>{hideBuiltinProvider ? '显示' : '隐藏'}示例文档</Button> */}
                        </div>


                        {/* <Button style={{ marginLeft: '40px' }} icon={<SyncOutlined />} type="text" onClick={() => { this.onCheckUpdate() }}>检查更新(<span style={{ fontSize: '12px' }}>{version}</span>)</Button> */}
                    </>}
                    footer={null}
                    onOk={this.onOk}
                    onCancel={this.onOk}
                    width={620}
                    top="-500px"
                    maskStyle={{ backgroundColor: 'transparent' }}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    wrapClassName="settings-modal"
                >
                    <div className="settings-main">
                        <Menu
                            mode="inline"
                            onSelect={this.onSelect}
                            defaultSelectedKeys={defaultSelectedKeys}
                            defaultOpenKeys={defaultOpenKeys}
                            style={{ width: 150 }}>
                            {/* <Menu.Item key="imageHosting" icon={<PictureOutlined />}>图床</Menu.Item> */}
                            <SubMenu key="docProviders" icon={<SisternodeOutlined />} title={<><span>{i18n.t("settings.repository")}</span></>}>
                                {Items}
                            </SubMenu>
                        </Menu>
                        <div className="settings-tab">
                            {Body}
                        </div>
                    </div>
                    <div className="settings-footer">
                        <SettingsClear />
                        <SettingsImport />
                        <SettingsExport />
                        <SettingsBackup />
                        <SettingsLoad />
                    </div>
                </TransitionModal>
                <DocsProviderAdd ref={(provider) => { this.provider = provider }} />
                {/* <AppUpdate ref={(update) => { this.update = update }} /> */}
            </div>
        )
    }
}