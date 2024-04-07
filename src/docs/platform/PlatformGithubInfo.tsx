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

class PlatformGithubInfo extends Component<{
    info: PlatformParams,
    type: string
} & WithTranslation> {

    render() {
        const { info, type, t } = this.props;
        const github = parseInfo(info);
        return (
            <>
                <Form.Item shouldUpdate={() => true} preserve={false} name={`${type}_token`} label={t("settings.accessToken")} rules={[{ required: true }]} initialValue={github.token}>
                    <Input disabled value={github.token} />
                </Form.Item>
                <Form.Item shouldUpdate={() => true} preserve={false} name={`${type}_repo`} label={t("settings.repository")} rules={[{ required: true }]} initialValue={github.repo}>
                    <Input disabled value={github.repo} />
                </Form.Item>
            </>
        )
    }
}

export default withTranslation()(PlatformGithubInfo)