import { Button, message } from "antd"
import store from "../store"
import sharedEventBus from "../utils/sharedEventBus"
import './withVipCheck.less'
import { useTranslation } from "react-i18next"

export function withVipCheck(WrappedComonent: any, msg?: string) {

    return function(props: any) {

        const { t } = useTranslation()
        const onClick = () => {

            if(store.getState().auth.vip?.is_vip) {
                if(props.onClick) {
                    props.onClick()
                }
            } else {
                message.warning(msg || t("auth.loginVipRequired"))
                sharedEventBus.trigger('showAccount')
            }
        }


        return <span className="wrapped-vip"><WrappedComonent {...props} onClick={onClick}/></span>
    }
}

export const VipCheckButton = withVipCheck(Button)