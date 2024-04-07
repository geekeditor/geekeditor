import { Button, message } from "antd"
import store from "../store"
import sharedEventBus from "../utils/sharedEventBus"
import { useTranslation } from "react-i18next"

export function withLoginCheck(WrappedComonent: any, msg?: string) {

    return function(props: any) {

        const { t } = useTranslation()
        const onClick = () => {

            if(store.getState().auth.logined) {
                if(props.onClick) {
                    props.onClick()
                }
            } else {
                message.warning(msg || t("auth.loginRequired"))
                sharedEventBus.trigger('showAccount')
            }
        }


        return <WrappedComonent {...props} onClick={onClick}/>
    }
}

export const LoginCheckButton = withLoginCheck(Button)