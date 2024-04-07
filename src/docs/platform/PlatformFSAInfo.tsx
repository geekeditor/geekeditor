import React, { Component } from "react"
import { Form, Input } from 'antd'
import { PlatformParams } from "../../types/platform";
import { WithTranslation, withTranslation } from "react-i18next";

// f0ed4f147283cd4f685ba00fdf3fbe0c6e87b96a

export function parseInfo(info: PlatformParams) {

    let name = '';
    try {
        name = JSON.parse(info.repo).name || ''
    } catch (error) {
        
    }

    return name
}

class PlatformFSAInfo extends Component<{
    info: PlatformParams,
    type: string
} & WithTranslation, {
}> {

    render() {

        const {type, info, t} = this.props;

        const name = parseInfo(info);

        return (
            <>
                <Form.Item name={`${type}_repo`} label={t("settings.rootDirectory")} rules={[{ required: true, message: '请设置存储根目录' }]} initialValue={name}>
                    <Input placeholder={t("settings.rootDirectoryPath")} disabled/>
                </Form.Item>
            </>
        )
    }
}

export default withTranslation()(PlatformFSAInfo)