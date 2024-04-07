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

class PlatformGitlabInfo extends Component<{
    info: PlatformParams,
    type: string
} & WithTranslation> {

    render() {
        const { info, type, t } = this.props;
        const gitlab = parseInfo(info);
        return (
            <>
                <Form.Item shouldUpdate={() => true} preserve={false} name={`${type}_token`} label={t("settings.accessToken")} rules={[{ required: true }]} initialValue={gitlab.token}>
                    <Input disabled value={gitlab.token} />
                </Form.Item>
                <Form.Item shouldUpdate={() => true} preserve={false} name={`${type}_repo`} label={t("settings.repository")} rules={[{ required: true }]} initialValue={gitlab.repo}>
                    <Input disabled value={gitlab.repo} />
                </Form.Item>
            </>
        )
    }
}

export default withTranslation()(PlatformGitlabInfo)