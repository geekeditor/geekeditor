import React, { Component } from "react"
import GITLAB from '../../api/gitlab'
import { Form, Input, Select, Button, Empty, Divider, Checkbox } from 'antd'
import { PlusOutlined, ReloadOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { PlatformType } from "../../types/platform"
import { WithTranslation, withTranslation } from "react-i18next"
const { Option, OptGroup } = Select

// f0ed4f147283cd4f685ba00fdf3fbe0c6e87b96a

class PlatformGitlab extends Component<{
    type: string;
    setField: (field:{[key:string]:string})=>void;
} & WithTranslation, {
    tokenChecking: boolean;
    token: string;
    tokenChecked: boolean;
    repos: any[];
    selRepo: string | undefined;
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            tokenChecking: false,
            tokenChecked: false,
            token: '',
            repos: [],
            selRepo: undefined
        }
    }

    onTokenChecking = () => {
        const { token } = this.state;
        this.setState({
            tokenChecking: true
        })
        GITLAB.checkRepos(token).then((response: any) => {

            if (response.status === 200) {
                const repos = response.data.map((item: any) => {
                    return { jsDelivr: true, token: token, id: item.id, name: item.name, owner: { login: item.owner.username, id: item.owner.id, avatar_url: item.owner.avatar_url }, private: item.visibility !== 'public', permissions: item.permissions }
                })
                this.setState({
                    repos: repos,
                    tokenChecked: response.status === 200
                })
            }

            this.setState({
                tokenChecking: false,
            })
        })
    }

    onTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            token: e.target.value,
            tokenChecked: false,
            repos: [],
            selRepo: undefined
        })
    }

    onSelectRepo = (value: string) => {
        this.setState({
            selRepo: value
        })
    }

    render() {

        const {type, t} = this.props;
        const { tokenChecking, token, tokenChecked, repos, selRepo } = this.state;
        const PrivateOptions: any[] = [];
        const PublicOptions: any[] = [];
        const ImageOptions: any[] = [];
        repos.forEach((repo: any) => {
            if (repo.private) {
                PrivateOptions.push(<Option key={repo.id} value={JSON.stringify(repo)}>{repo.name}</Option>)
            } else {
                PublicOptions.push(<Option key={repo.id} value={JSON.stringify(repo)}>{repo.name}</Option>)
                ImageOptions.push(<Option key={repo.id} value={JSON.stringify(repo)}>{repo.name}</Option>)
            }
        })
        const OptGroups: any[] = [];
        const ImageOptGroups: any[] = [];
        if (PrivateOptions.length) {
            OptGroups.push(<OptGroup key="private" label={t("settings.privateRepository")}>{PrivateOptions}</OptGroup>)
        }
        if (PublicOptions.length) {
            OptGroups.push(<OptGroup key="public" label={t("settings.publicRepository")}>{PublicOptions}</OptGroup>)
            ImageOptGroups.push(<OptGroup key="public" label={t("settings.publicRepository")}>{ImageOptions}</OptGroup>)
        }

        return (
            <>
                <Form.Item extra={<><a style={{fontSize: '12px'}} href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank">{t("settings.getAccessToken")}</a><a style={{fontSize: '12px', float: 'right', lineHeight: '24px'}} href="http://mp.weixin.qq.com/s?__biz=MzU3MDMyNDk5OQ==&mid=2247484534&idx=1&sn=ce394638528a92f3bc581f7d08f74e99&chksm=fcf0651ecb87ec08102d798394d6ace942595257378727dc3b0a2eca3c3b546997e2242c93f2#wechat_redirect" target="_blank"><QuestionCircleOutlined style={{marginRight: '5px'}}/>{t("settings.guide")}</a></>} name={`${type}_token`} label={t("settings.accessToken")} rules={[{ required: true, message: '请填写AccessToken' }]} validateStatus={tokenChecked ? 'success' : 'error'}>
                    <Input value={token} onChange={this.onTokenChange} addonAfter={!tokenChecked ? <Button disabled={!token} loading={tokenChecking} size="small" type="text" onClick={this.onTokenChecking}>{t("settings.validate")}</Button> : <span style={{ color: 'green' }}>{t("settings.validateSuccess")}</span>} />
                </Form.Item>
                <Form.Item name={`${type}_repo`} extra={type === 'image' && <span style={{fontSize: '12px'}}>{t("settings.imageHostingTips")}</span>} label={t("settings.repository")} rules={[{ required: true, message: t("settings.repositoryRequired") }]}>
                    <Select
                        showSearch
                        allowClear
                        style={{ width: '100%' }}
                        placeholder={t("settings.repositorySelect")}
                        value={selRepo}
                        onChange={this.onSelectRepo}
                        notFoundContent={
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
                                !tokenChecked ? <span>{t("settings.validateRequired")}</span> :
                                    <span>{t("settings.noRepository")}</span>
                            } />
                        }
                        dropdownRender={menu => (
                            <div>
                                {menu}
                                <Divider style={{ margin: '4px 0' }} />
                                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8, alignItems: 'center' }}>
                                    
                                    <Button disabled={!token} onClick={this.onTokenChecking} loading={tokenChecking} icon={<ReloadOutlined />}>{t("common.refresh")}</Button>
                                    <a
                                        style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                        href='https://gitlab.com/projects/new'
                                        target="_blank"
                                    >
                                        <PlusOutlined /> {t("settings.newRepository")}
              </a>
                                </div>
                            </div>
                        )}
                    >
                        {type === 'image' ? ImageOptGroups : OptGroups}
                    </Select>
                </Form.Item>
            </>
        )
    }
}

export default withTranslation()(PlatformGitlab)