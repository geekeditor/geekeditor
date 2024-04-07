import React, { Component } from "react"
import { Form, Input } from 'antd'
import { PlatformParams } from "../../types/platform";
import { WithTranslation, withTranslation } from "react-i18next";

// f0ed4f147283cd4f685ba00fdf3fbe0c6e87b96a

class PlatformLocalInfo extends Component<{
    info: PlatformParams,
    type: string
} & WithTranslation, {
}> {

    render() {

        const {type, info, t} = this.props;

        return (
            <>
                <Form.Item name={`${type}_repo`} label={t("settings.rootDirectory")} rules={[{ required: true, message: t("settings.rootDirectoryPathRequired") }]} initialValue={info.repo}>
                    <Input placeholder={t("settings.rootDirectoryPath")} disabled/>
                </Form.Item>
            </>
        )
    }
}

export default withTranslation()(PlatformLocalInfo)