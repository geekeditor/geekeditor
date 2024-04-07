import React, { Component } from "react"
import "./AppStatusBar.less"
import { isLocal } from "../api/local"
import { version } from '../version'
import { appDownloadUrl } from "../utils/utils";
import AppQRCode from "./AppQRCode";
import AppGuide from "./AppGuide";
import AppOnTop from "./AppOnTop";
const isElectron = isLocal();


export default class AppStatusBar extends Component {
    render() {
        return (
            <div className="app-status-bar">
                {isElectron && <><AppOnTop /></>}
                <AppQRCode />
                <AppGuide />
                
                {
                    // !isElectron && <>
                    //     <div className="app-copyright" style={{marginLeft: '10px'}}>
                    //         {/* Copyright © 2021-2023 <strong><a href="/">{`极客编辑器`}</a>  </strong> <span><a className="theme-color" style={{ fontWeight: 'bolder', color: "#388ae5 !important" }} href={appDownloadUrl} target="_blank">安装浏览器扩展</a> </span> */}
                    //         <a href="http://beian.miit.gov.cn/" target="_blank">备案号: 湘ICP备18009160号-4</a>
                    //     </div>
                    //     <div className="app-friendly-links">
                    //         <strong>友情链接：</strong>
                    //         <a href="http://h5.dooring.cn/" target="_blank">H5-dooring编辑器</a>
                    //     </div>
                    // </>
                }

            </div>
        )
    }
}