import React, { Component } from "react"
import './DocsProviderAdd.less'
import { Select, Button, Form, Input, Divider, FormInstance, message } from 'antd';
import { PlusOutlined, SisternodeOutlined, QuestionCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { docs, hostings } from './platform'
import { EPlatformType, PlatformGithubRepoObj } from "../types/platform.d";
import { EInitResultStatus, IDocsProviderSettingInfo } from "../types/docs.d"
import GithubData from './docsprovider/data/github';
import sharedPreferences from "../utils/sharedPreferences"
import { createDocsData, createDocsImageHosting } from './docsprovider/utils'
import TransitionModal from '../widgets/TransitionModal'
import { isCompatible } from "../utils/browser";
import i18n from "../i18n";
import sharedPreferencesKeys from "../utils/sharedPreferencesKeys";

const { Option } = Select;

const layout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 7, span: 16 },
};

let repoIndex = 0;
const now = Date.now();
export function createDocRepoID() {
    return `${now}${++repoIndex}`
}

export default class SettingsDocProviderAdd extends Component<{
}, {
    docSelectPlatform: EPlatformType;
    imageSelectPlatform: EPlatformType;
    initingRepo: boolean;
}> {

    private transitionModal!: TransitionModal|null;
    private alertModal!: TransitionModal|null;
    private form!:FormInstance|null;
    constructor(props: any) {
        super(props);
        this.state = {
            docSelectPlatform: EPlatformType.EPlatformTypeNone,
            imageSelectPlatform: EPlatformType.EPlatformTypeNone,
            initingRepo: false
        }
        
    }

    onDocSelectPlatform = (key: EPlatformType) => {
        this.setState({
            docSelectPlatform: key
        })
    }

    onImageSelectPlatform = (key: EPlatformType) => {
        this.setState({
            imageSelectPlatform: key
        })
    }

    onClearImagePlatform = () => {
        this.setState({
            imageSelectPlatform: EPlatformType.EPlatformTypeNone
        })
    }

    show() {
        
        if(this.transitionModal && isCompatible) {
            this.transitionModal.showTransition();
        } else if(this.alertModal && !isCompatible) {
            this.alertModal.showTransition();
        }
    }

    onHide = () => {
        if(this.alertModal) {
            this.alertModal.showTransition();
        }
        if(this.transitionModal) {
            this.transitionModal.hideTransition();
        }
        this.setState({
            docSelectPlatform: EPlatformType.EPlatformTypeNone,
            imageSelectPlatform: EPlatformType.EPlatformTypeNone
        })
    }

    onPlatformAdd = async (values: any) => {
        try {
            const provider: IDocsProviderSettingInfo = {
                id: createDocRepoID(),
                title: values.title,
                doc_repo: {
                    platform: values.doc_platform,
                    token: values.doc_token || '',
                    repo: values.doc_repo || ''
                },
                image_repo: {
                    platform: values.image_platform,
                    token: values.image_token || '',
                    repo: values.image_repo || ''
                }
            }
            const data = await createDocsData(provider.doc_repo);
            const imageHosting = createDocsImageHosting(provider.image_repo);
            if (data) {
                this.setState({
                    initingRepo: true
                })
                const checks = [data.init()]
                if(imageHosting) {
                    checks.push(imageHosting.init())
                }
                Promise.all(checks).then((results)=>{
                    this.setState({
                        initingRepo: false
                    })
                    if (results[0].status !== EInitResultStatus.EInitResultStatusSuccess) {
                        message.error(`${i18n.t("settings.addDocRepositoryFailed")}${results[0].status === EInitResultStatus.EInitResultStatusNoBranch ? i18n.t("settings.repositoryNotInit"): i18n.t("settings.checkRepository")}`)
                        return;
                    }

                    if (imageHosting && results[1].status !== EInitResultStatus.EInitResultStatusSuccess) {
                        message.error(`${i18n.t("settings.addImageRepositoryFailed")}${results[1].status === EInitResultStatus.EInitResultStatusNoBranch ? i18n.t("settings.repositoryNotInit"): i18n.t("settings.checkRepository")}`)
                        return;
                    }

                    const providers = sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsDocProviders) || [];
                    providers.push(provider);
                    sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsSelectedProvider, data.uniqueID)
                    sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsDocProviders, providers);
                    this.onHide();
                })
            }

        } catch (error) {

        }


    }

    onChangeField = (field:{[key:string]:string})=>{
        if(this.form) {
            this.form.setFieldsValue(field);
        }
    }

    onConfirmAlert = () => {
        if(this.alertModal) {
            this.alertModal.hideTransition();
        }
    }

    render() {

        const { initingRepo, docSelectPlatform, imageSelectPlatform } = this.state
        const DocOptions = Object.keys(docs).filter((key)=>!docs[parseInt(key)].hide).map((key) => {
            const platform = docs[parseInt(key)];
            return <Option key={platform.type} value={platform.type}>{platform.name}</Option>
        })
        const docSelectPlatformComp = docs[docSelectPlatform] ? docs[docSelectPlatform].edit : null;

        const ImageOptions = Object.keys(hostings).filter((key)=>!hostings[parseInt(key)].hide).map((key) => {
            const platform = hostings[parseInt(key)];
            return <Option key={platform.type} value={platform.type}>{platform.name}</Option>
        })
        const imageSelectPlatformComp = hostings[this.state.imageSelectPlatform] ? hostings[this.state.imageSelectPlatform].edit : null;
        return (
            <div className="docs-provider-add">
                <TransitionModal
                    ref={(modal)=>{this.transitionModal=modal}}
                    title={<><SisternodeOutlined /><span style={{ marginLeft: '5px' }}>{i18n.t("settings.addRepository")}</span></>}
                    footer={null}
                    onOk={this.onHide}
                    onCancel={this.onHide}
                    width={500}
                    top="-500px"
                    maskStyle={{backgroundColor: 'transparent'}}
                    destroyOnClose={true}
                    transitionName=""
                    maskTransitionName=""
                    wrapClassName="docs-provider-add-modal"
                >
                    <div className="docs-provider-add-modal-body">
                        <Form ref={(form)=>{this.form = form}} {...layout} name="docs-provider-add-form" onFinish={this.onPlatformAdd}>
                            <Divider orientation="left">{i18n.t("settings.docRepository")}</Divider>
                            <Form.Item name="doc_platform" label={i18n.t("settings.storagePlatform")} rules={[{ required: true, message: i18n.t("settings.selectDocRepository") }]}>
                                <Select
                                    placeholder={i18n.t("settings.selectStoragePlatform")}
                                    onSelect={this.onDocSelectPlatform}
                                >
                                    {DocOptions}
                                </Select>
                            </Form.Item>
                            {!!docSelectPlatformComp && React.createElement(docSelectPlatformComp, { type: 'doc', setField: this.onChangeField })}
                            <Divider orientation="left">{i18n.t("settings.imageRepository")}（{i18n.t("common.optional")}）</Divider>
                            <Form.Item name="image_platform" label={i18n.t("settings.storagePlatform")} extra={<span style={{fontSize: '12px'}}>{i18n.t("settings.imageRepositoryTips")}</span>} rules={[{ required: false, message: i18n.t("settings.selectImageRepository")  }]}>
                                <Select
                                    placeholder={i18n.t("settings.selectStoragePlatform")}
                                    onSelect={this.onImageSelectPlatform}
                                    allowClear
                                    onClear={this.onClearImagePlatform}
                                >
                                    {ImageOptions}
                                </Select>
                            </Form.Item>
                            {!!imageSelectPlatformComp && React.createElement(imageSelectPlatformComp, { type: 'image', setField: this.onChangeField })}
                            <Form.Item {...tailLayout}>
                                <Button loading={initingRepo} disabled={initingRepo} type="primary" htmlType="submit" icon={<PlusOutlined />}>{initingRepo ? i18n.t("common.initializing") : i18n.t("common.add")}</Button>
                                <Button style={{ marginLeft: '10px', display: 'none' }} type="link" htmlType="button" icon={<QuestionCircleOutlined />}>{i18n.t("common.help")}</Button>
                            </Form.Item>
                        </Form>
                    </div>
                </TransitionModal>
                {!isCompatible && <TransitionModal
                    ref={(modal) => { this.alertModal = modal }}
                    title={null}
                    footer={<div className="alert-modal__footer"><div className="alert-modal__footer-right"><Button type="primary" onClick={this.onConfirmAlert} >{i18n.t("common.got")}</Button></div></div>}
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
                            <span>{i18n.t("settings.notCompatible")}</span>
                        </div>
                        <div className="alert-modal__info">
                            <span>{i18n.t("settings.compatibleTips")}</span>
                        </div>
                    </div>
                </TransitionModal>}
            </div>
        )
    }
}