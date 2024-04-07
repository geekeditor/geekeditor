import React, { Component } from "react"
import { Form, Input } from 'antd'
import { PlatformParams } from "../../types/platform"
import { WithTranslation, withTranslation } from "react-i18next";

// f0ed4f147283cd4f685ba00fdf3fbe0c6e87b96a

export function parseInfo(info: PlatformParams) {

    let name = '';
    try {
        name = JSON.parse(info.repo).name || ''
    } catch (error) {
        
    }

    return {
        token: info.token,
        repo: name
    }
}

class PlatformGiteeInfo extends Component<{
    info: PlatformParams,
    type: string
} & WithTranslation> {

    render() {
        const { info, type, t } = this.props;
        const gitee = parseInfo(info);
        return (
            <>
                <Form.Item shouldUpdate={() => true} preserve={false} name={`${type}_token`} label={t("settings.accessToken")} rules={[{ required: true }]} initialValue={gitee.token}>
                    <Input disabled value={gitee.token} />
                </Form.Item>
                <Form.Item shouldUpdate={() => true} preserve={false} name={`${type}_repo`} label={t("settings.repository")} rules={[{ required: true }]} initialValue={gitee.repo}>
                    <Input disabled value={gitee.repo} />
                </Form.Item>
            </>
        )
    }
}

export default withTranslation()(PlatformGiteeInfo)