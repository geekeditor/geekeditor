import React, { Component } from 'react'
import './WinTabExport.less'
import { Popover, Divider, Button, message } from 'antd';
import { FilePdfOutlined, ExportOutlined, WechatOutlined, Html5Outlined, FileImageOutlined, FileWordOutlined, LoadingOutlined, FileMarkdownOutlined, FileZipOutlined, FileOutlined, FileTextOutlined } from '@ant-design/icons';
import { IDocsNode } from '../../../types/docs';
import { copyContent, getFileFullname, saveToDisk } from '../../../utils/utils';
import exportInstance from '../../../export';
import MenuItem from '../../../widgets/MenuItem';
import { WithTranslation, withTranslation } from 'react-i18next';
// import { isLocal } from '../../../../api/local';


// const isDesktop = isLocal();

class WinTabExport extends Component<{
    node: IDocsNode;
} & WithTranslation, {
    exportingType: string;
    copyingType: string;
    menuBarVisible: boolean;
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            exportingType: '',
            copyingType: '',
            menuBarVisible: false
        }
    }

    onExportContent = async (type: string) => {
        const { editable } = this.props.node;
        if (editable) {
            const title = this.props.node.title
            const id = this.props.node.id || ''
            this.setState({
                exportingType: type
            })
            const format = type === "md" || type === "text" ? type : "html"
            let content = await editable.getContent(format);
            if (type === 'md' || type === 'text') {
                const fullname = getFileFullname(title, type)
                saveToDisk(fullname, content).finally(() => {
                    this.onMenuBarVisible(false)
                })
            } else {
                exportInstance.show({content, type, title, id})
                this.onMenuBarVisible(false)
            }
            this.setState({
                exportingType: ''
            })
        }
    }

    onMenuBarVisible = (visible: boolean) => {
        this.setState({
            menuBarVisible: visible
        })
    }

    render() {
        const { t, node } = this.props
        const { exportingType, menuBarVisible } = this.state;
        const isDisabled = node.extension !== '.md';
        const content = (
            <div>
                <MenuItem name={t("settings.officialAccount")} icon={exportingType === 'wechat' ? <LoadingOutlined /> : <i className="gei-official-account" style={{color: 'currentColor'}}></i>} onClick={() => { this.onExportContent('wechat') }} />
                <Divider plain className="ge-menu-divider"></Divider>
                <MenuItem name={t("settings.imageType")} icon={exportingType === 'image' ? <LoadingOutlined /> : <FileImageOutlined />} onClick={() => this.onExportContent('image')} />
                <MenuItem name="HTML（.html）" icon={exportingType === 'html' ? <LoadingOutlined /> : <Html5Outlined />} onClick={() => this.onExportContent('html')} />
                {/* <MenuItem incoming={true} name="Word（.docx）" icon={exportingType === 'docx' ? <LoadingOutlined /> : <FileWordOutlined />} onClick={() => this.onExportContent('docx')} /> */}
                <MenuItem incoming={true} name="PDF（.pdf）" icon={exportingType === 'pdf' ? <LoadingOutlined /> : <FilePdfOutlined />} onClick={() => this.onExportContent('pdf')} />
                <MenuItem incoming={true} name="TextBundle（.textbundle）" icon={exportingType === 'textbundle' ? <LoadingOutlined /> : <FileZipOutlined />} onClick={() => this.onExportContent('md')} />
                <MenuItem name="Markdown（.md）" icon={exportingType === 'md' ? <LoadingOutlined /> : <FileMarkdownOutlined />} onClick={() => this.onExportContent('md')} />
                <MenuItem name="TXT（.txt）" icon={exportingType === 'text' ? <LoadingOutlined /> : <FileTextOutlined />} onClick={() => this.onExportContent('text')} />
            </div>
        );
        return (
            <Popover placement="bottomRight" title={null} open={menuBarVisible} onOpenChange={this.onMenuBarVisible} content={content} trigger="hover">
                <span className={["win-tab-bar__op", isDisabled ? " win-tab-bar__op--disabled" : "", menuBarVisible ? " active" : ""].join("")}><ExportOutlined /></span>
            </Popover>
        )
    }
}

export default withTranslation()(WinTabExport)