import React, { Component } from 'react'
// import BarItem from '../widgets/BarItem'
// import { QrcodeOutlined } from '@ant-design/icons'
import "./AppTopBar.less"
// import AppQRCode from './AppQRCode'
import AppVIP from './AppVIP'
import { IDocsNodeBase } from '../types/docs'
import { toggleFullscreen } from '../utils/utils';

export default class AppTopBar extends Component<{
    activeNode: IDocsNodeBase | undefined;
}> {
    onToggleWindow = () => {
        toggleFullscreen()
    }
    render() {
        const {activeNode} = this.props;
        const title = activeNode ? activeNode.title : '极客编辑器'
        return (
            <div className="app-top-bar" onDoubleClick={this.onToggleWindow}>
                <div className="app-title">
                    {/* <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12"><path d="M102.925498 991.418182c-27.927273 23.272727-74.472727 69.818182-51.2-37.236364 46.545455-181.527273 512-884.363636 902.981818-954.181818 111.709091 0-204.8 260.654545-204.8 260.654545s107.054545 13.963636 181.527273-60.50909c-46.545455 218.763636-246.690909 218.763636-297.890909 232.727272 60.509091 9.309091 107.054545 37.236364 200.145455 9.309091-23.272727 60.509091-111.709091 139.636364-437.527273 214.109091-144.290909 51.2-265.309091 311.854545-293.236364 335.127273z" fill="#000000" ></path></svg> */}
                    <span>{title}</span>
                </div>
                <div className="app-top-items">
                    <AppVIP />
                    <div className="app-top-bar-ext"></div>
                    {/* <AppQRCode /> */}
                </div>
            </div>
        )
    }
}