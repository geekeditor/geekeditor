import React, { useRef, useState } from "react"
import TransitionModal from '../widgets/TransitionModal'
import { Input, Button, Form, message } from "antd"
import { CloudDownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { getUserConfig } from "../api/app";
import { decrypt } from "../utils/encrypt";
import sharedPreferences from "../utils/sharedPreferences";
import { useTranslation } from "react-i18next";
import { LoginCheckButton } from "../HOC/withLoginCheck";


export default function SettingsLoad() {

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

    const onLoad = () => {
        setLoading(true);
        getUserConfig().then((value)=>{

            if (value.content) {
                setContent(value.content);
                onShow()
            } else {
                message.warning(t("settings.cloudConfigEmpty"))
            }
            
        }).finally(()=>{
            setLoading(false)
        })
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


    return (
        <>
            <LoginCheckButton type="text" icon={loading ? <LoadingOutlined /> : <CloudDownloadOutlined />} loading={loading} disabled={loading} onClick={onLoad}>{t("settings.loadFromCloud")}</LoginCheckButton>
            <TransitionModal
                ref={transitionModal}
                title={<><span>{t("settings.loadCloudConfig")}</span></>}
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
                                {t("common.load")}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </TransitionModal>
        </>
    )
}