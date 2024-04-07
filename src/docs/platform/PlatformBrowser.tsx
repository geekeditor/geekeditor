import React, { Component } from "react"
import { Form, Input } from 'antd'
import { WithTranslation, withTranslation } from "react-i18next";

// f0ed4f147283cd4f685ba00fdf3fbe0c6e87b96a

class PlatformBrowser extends Component<{
    type: string;
    setField: (field:{[key:string]:string})=>void;
} & WithTranslation, {
}> {

    render() {

        const {type, t} = this.props;

        return (
            <>
                <Form.Item extra={<span style={{fontSize: '12px'}}>{t("settings.accessPasswordTips")}</span>} name={`${type}_token`} label={t("settings.accessPassword")} rules={[{ required: true, message: t("settings.accessPasswordRequired") }]}>
                    <Input placeholder={t("settings.accessPasswordSetting")}/>
                </Form.Item>
            </>
        )
    }
}

export default withTranslation()(PlatformBrowser)