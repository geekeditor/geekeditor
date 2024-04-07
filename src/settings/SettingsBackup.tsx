import React, { useRef, useState } from "react"
import TransitionModal from '../widgets/TransitionModal'
import { Input, Button, Form } from "antd"
import { CloudUploadOutlined, LoadingOutlined } from "@ant-design/icons";
import sharedPreferences from "../utils/sharedPreferences";
import { encrypt } from "../utils/encrypt";
import { postUserConfig } from "../api/app";
import { useTranslation } from "react-i18next";
import { LoginCheckButton } from "../HOC/withLoginCheck";




export default function SettingsBackup() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
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
        setLoading(true)
        sharedPreferences.backup().then((value)=>{
            return encrypt(value, values.password)
        }).then((config)=>{
            return postUserConfig({content: config})
        }).then(()=>{
            onHide();
        }).finally(()=>{
            setLoading(false);
            
        })
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
            <LoginCheckButton onClick={onShow} type="text" icon={<CloudUploadOutlined />}>{t("settings.backupToCloud")}</LoginCheckButton>
            <TransitionModal
                ref={transitionModal}
                title={<><span>{t("settings.backupTitle")}</span></>}
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
                                <Input placeholder={t("settings.setPassword")} />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" icon={loading && <LoadingOutlined />} loading={loading} disabled={loading}>
                                {t("common.backup")}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </TransitionModal>
        </>
    )
}