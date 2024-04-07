import React, { Component } from 'react'
import './WinMediaBar.less'
import { appDownloadUrl } from '../../utils/utils'
import { WithTranslation, withTranslation } from 'react-i18next';

class WinMediaBar extends Component<WithTranslation, {
}> {

    constructor(props: any) {
        super(props);
    }

    render() {
        const {t} = this.props;
        return (
            <>
                <div id="win-media-bar" className={["win-media-bar"].join('')}>
                    <div className="win-media-bar__tip">
                        <span><a target="_blank" href={appDownloadUrl}>{t("settings.installExtension")}</a>{t("settings.manageOAActicles")}</span>
                    </div>
                </div>
            </>
        )
    }
}

export default withTranslation()(WinMediaBar);