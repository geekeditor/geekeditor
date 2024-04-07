import React, { useRef, useState } from "react"
import TransitionModal from '../widgets/TransitionModal'
import { Input, Button, Form, Upload, UploadProps, message } from "antd"
import { ExportOutlined, ImportOutlined, LoadingOutlined } from "@ant-design/icons";
import { decrypt } from "../utils/encrypt";
import sharedPreferences from "../utils/sharedPreferences";
import { Base64 } from "js-base64";
import { useTranslation } from "react-i18next";


export default function SettingsImport() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const transitionModal = useRef<TransitionModal>(null);
    const onHide = () => {
        if (transitionModal.current) {
            transitionModal.current.hideTransition();
        }
    }
    const onShow = () => {
        if (transitionModal.current) {
            transitionModal.current.showTransition();
        }
    }

    const onSubmit = (values: any) => {

        if (values) {

            try {
                setLoading(true)
                const decryptContent = decrypt(content, values.password)
                if (decryptContent) {

                    sharedPreferences.import(decryptContent).then(() => {

                        onHide()

                        setTimeout(() => {
                            window.location.reload()
                        }, 100)
                    }).finally(() => {
                        setLoading(false);
                    })
                }
            } catch (error) {
                setLoading(false);
                message.error(t("settings.decryptError"))

            }


        }
    }

    const onSubmitFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const passwordRules = [{ required: true, message: t("common.passwordRequired") }, {
        validator(_: any, value: string) {
            if (!value || /^.{4,}$/.test(value)) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(t("settings.passwordLengthRequired")));
        }
    }]

    const props: UploadProps = {
        showUploadList: false,
        beforeUpload: (file) => {

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                if (e.target && e.target.result && typeof e.target.result === 'string') {
                    const content = e.target.result.split(',').pop() || '';
                    if (content) {
                        setContent(Base64.decode(content));
                        onShow()
                    } else {
                        message.warning(t("settings.readFileEmpty"))
                    }
                } else {
                    message.error(t("settings.readFileError"))
                }
            }


            return false;
        }
    };

    return (
        <>
            <span style={{ display: 'inline-block' }}>
                <Upload {...props} style={{ display: 'inline-block' }}>
                    <Button type="text" icon={<ImportOutlined />}>{t("common.import")}</Button>
                </Upload>
            </span>
            <TransitionModal
                ref={transitionModal}
                title={<><span>{t("settings.importConfig")}</span></>}
                footer={null}
                onOk={onHide}
                onCancel={onHide}
                width={300}
                top="-300px"
                maskStyle={{ backgroundColor: 'transparent' }}
                destroyOnClose={true}
                transitionName=""
                maskTransitionName=""
                closeIcon={null}
                closable={true}
                wrapClassName="settings-operation-modal"
            >
                <div className="settings-form">
                    <Form
                        name="basic"
                        style={{ maxWidth: 600 }}
                        initialValues={{ remember: true }}
                        onFinish={onSubmit}
                        onFinishFailed={onSubmitFailed}
                        autoComplete="off"
                    >

                        <Form.Item
                            className="settings-form-row"
                        >
                            <Form.Item
                                name="password"
                                rules={passwordRules}
                            >
                                <Input placeholder={t("settings.inputDecryptPassword")} />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" icon={loading && <LoadingOutlined />} loading={loading} disabled={loading}>
                                {t("common.import")}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </TransitionModal>
        </>
    )
}