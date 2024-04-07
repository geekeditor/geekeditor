import React, { Component } from "react";
import { Divider, Button, Form, Input, Popconfirm } from "antd";
import { docs, hostings } from "../docs/platform";
import sharedPreferences from "../utils/sharedPreferences";
import { IDocsProviderSettingInfo } from "../types/docs";
import { withTranslation, WithTranslation } from "react-i18next";

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 6, span: 16 },
};

class SettingsDocProvider extends Component<
    {
        provider: IDocsProviderSettingInfo;
    } & WithTranslation,
    {
        fieldChanged: boolean;
    }
> {
    constructor(props: any) {
        super(props);
        this.state = {
            fieldChanged: false,
        };
    }

    onSaveDocProvider = (values: any) => {
        const providers: IDocsProviderSettingInfo[] =
            sharedPreferences.getSetting("doc_providers") || [];
        const { provider } = this.props;
        providers.forEach((p, index) => {
            if (p.id === provider.id) {
                const { title } = values;
                providers[index] = Object.assign(p, { title });
            }
        });
        sharedPreferences.setSetting("doc_providers", providers);
        this.setState({
            fieldChanged: false,
        });
    };

    onDeleteDocProvider = () => {
        const providers: IDocsProviderSettingInfo[] =
            sharedPreferences.getSetting("doc_providers") || [];
        const { provider } = this.props;
        providers.forEach((p, index) => {
            if (p.id === provider.id) {
                providers.splice(index, 1);
            }
        });
        sharedPreferences.setSetting("doc_providers", providers);
    };

    onFieldsChange = () => {
        this.setState({
            fieldChanged: true,
        });
    };

    render() {
        const { provider, t } = this.props;
        const { fieldChanged } = this.state;
        const docPlatformComp = docs[provider.doc_repo.platform].info;
        const imagePlatform = hostings[provider.image_repo.platform];
        const imagePlatformComp = imagePlatform && imagePlatform.info;
        return (
            <div className="settings-docs-provider">
                <Form
                    {...layout}
                    name="docs-provider"
                    preserve={false}
                    onFieldsChange={this.onFieldsChange}
                    onFinish={this.onSaveDocProvider}
                >
                    <Divider orientation="left">{t("settings.docRepository")}</Divider>
                    {/* <Form.Item name="title" label="显示名称" rules={[{ required: true }]} initialValue={provider.title}>
                        <Input placeholder="填写名称(e.g.: 技术文档/学习文档/...)"/>
                    </Form.Item> */}
                    <Form.Item
                        name="doc_platform"
                        label={t("settings.storagePlatform")}
                        rules={[{ required: true }]}
                        initialValue={docs[provider.doc_repo.platform].name}
                    >
                        <Input disabled />
                    </Form.Item>
                    {!!docPlatformComp &&
                        React.createElement(docPlatformComp, {
                            info: provider.doc_repo,
                            type: "doc",
                        })}
                    {!!imagePlatform && (
                        <>
                            <Divider orientation="left">{t("settings.imageRepository")}</Divider>
                            <Form.Item
                                name="image_platform"
                                label={t("settings.storagePlatform")}
                                rules={[{ required: true }]}
                                initialValue={
                                    hostings[provider.image_repo.platform].name
                                }
                            >
                                <Input disabled />
                            </Form.Item>
                            {!!imagePlatformComp &&
                                React.createElement(imagePlatformComp, {
                                    info: provider.image_repo,
                                    type: "image",
                                })}
                        </>
                    )}

                    <Form.Item {...tailLayout}>
                        <Button
                            disabled={!fieldChanged}
                            htmlType="submit"
                            type="primary"
                        >
                            {t("common.save")}
                        </Button>
                        <Popconfirm
                            onConfirm={this.onDeleteDocProvider}
                            destroyTooltipOnHide={{ keepParent: false }}
                            placement="top"
                            title={t("settings.removeRepositoryAlert")}
                            okText={t("common.ok")}
                            cancelText={t("common.cancel")}
                        >
                            <Button style={{ marginLeft: "10px" }}>{t("common.remove")}</Button>
                        </Popconfirm>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

export default withTranslation()(SettingsDocProvider)
