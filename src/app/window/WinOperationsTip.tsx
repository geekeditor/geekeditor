import React, { Component } from 'react';
import './WinOperationsTip.less'
import { EllipsisOutlined } from "@ant-design/icons"
import { WithTranslation, withTranslation } from 'react-i18next';

class AppOperationsTip extends Component<WithTranslation> {
    render() {
        const {t} = this.props
        return (
            <div className="win-operations-tip">
                <span>{t("landing.geekEditor")}</span>
                {/* <div className="vote-tip"><a href="https://creatorsdaily.com/ceb488a3-fc30-45c5-b4b0-3abbf88a89a6?utm_source=vote" target="_blank"><img className="light" src="https://creatorsdaily.com/api/ceb488a3-fc30-45c5-b4b0-3abbf88a89a6/vote.svg?theme=light" /></a></div> */}
            </div>
        )
    }
}

export default withTranslation()(AppOperationsTip)