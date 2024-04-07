import React, { Component } from "react"
import { Form, Input, Button } from 'antd'
import { selectFSADirectory } from '../../utils/utils'
import sharedFSAHandleCache from "../../utils/sharedFSAHandleCache"
import { withTranslation, WithTranslation } from "react-i18next";

// f0ed4f147283cd4f685ba00fdf3fbe0c6e87b96a

class PlatformFSA extends Component<{
    type: string;
    setField: (field: { [key: string]: string }) => void;
} & WithTranslation, {
    directory: string;
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            directory: ''
        }
    }

    onSelectDirectory = () => {
        selectFSADirectory().then((value) => {
            if (value) {

                sharedFSAHandleCache.set(value.fsaId, value.dirHandle, true).then(()=>{
                    const { type, setField } = this.props;
                    setField({
                        [`${type}_repo`]: JSON.stringify({
                            fsaId: value.fsaId,
                            name: value.dirHandle.name
                        })
                    })
                    this.setState({
                        directory: value.dirHandle.name
                    })
                })
            }
        })
    }

    render() {

        const { type, t } = this.props;
        const { directory } = this.state;
        return (
            <>
                <Form.Item name={`${type}_repo`} label={t("settings.rootDirectory")} initialValue={directory} rules={[{ required: true, message: t("settings.rootDirectoryPathRequired") }]}>
                    <div style={{ display: 'flex' }}>
                        <Input placeholder={t("settings.rootDirectoryPath")} readOnly={true} value={directory} />
                        <Button type="primary" style={{ marginLeft: '5px' }} onClick={this.onSelectDirectory}>{t("common.select")}</Button>
                    </div>
                </Form.Item>
            </>
        )
    }
}

export default withTranslation()(PlatformFSA)