import React, { useRef, useState } from "react"
import TransitionModal from '../widgets/TransitionModal'
import { Input, Button, Form } from "antd"
import { ClearOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import sharedPreferences from "../utils/sharedPreferences";
import { useTranslation } from "react-i18next";


export default function SettingsClear() {
    
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

    const onClear = () => {
        setLoading(true)
        sharedPreferences.clear().then(()=>{
            onHide();
            setTimeout(() => {
                window.location.reload()
            }, 100)
        }).finally(()=>{
            setLoading(false);
        })
    }

    return (
        <>
            <Button type="text" icon={<ClearOutlined />} onClick={onShow}>{t("common.clear")}</Button>
            <TransitionModal
                    ref={transitionModal}
                    title={null}
                    footer={<div className="alert-modal__footer"><div className="alert-modal__footer-right"><Button onClick={onHide}>{t("common.cancel")}</Button><Button type="primary" danger onClick={onClear}>{t("common.clear")}</Button></div></div>}
                    closable={false}
                    width={300}
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
                            <span>{t("settings.clearTitle")}</span>
                        </div>
                        <div className="alert-modal__info">
                            <span>{t("settings.clearTips")}</span>
                        </div>
                    </div>
                </TransitionModal>
        </>
    )
}