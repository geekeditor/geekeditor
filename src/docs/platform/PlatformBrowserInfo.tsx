import React, { Component } from "react"
import { Form, Input } from 'antd'
import { PlatformParams } from "../../types/platform";

// f0ed4f147283cd4f685ba00fdf3fbe0c6e87b96a

export default class PlatformBrowserInfo extends Component<{
    info: PlatformParams,
    type: string
}, {
}> {

    render() {

        const {type, info} = this.props;

        return (
            <>
                <Form.Item extra={<span style={{fontSize: '12px'}}>此标识用来查询浏览器数据库文档，请记住或保存好这个标识。</span>} name={`${type}_token`} label="标识" rules={[{ required: true, message: '请填写浏览器数据库区分标识' }]} initialValue={info.token}>
                    <Input placeholder="浏览器数据库区分标识" disabled/>
                </Form.Item>
            </>
        )
    }
}