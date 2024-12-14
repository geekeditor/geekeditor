import React, { useState } from 'react'
import { MoreOutlined } from "@ant-design/icons";
import { Popover } from 'antd';
import { useTranslation, withTranslation } from 'react-i18next';
import MenuItem from '../../../widgets/MenuItem';
import WinOpenedList from '../WinOpenedList';
import { IWinTab } from '../../../types/win';
import { IDocsNodeBase } from '../../../types/docs';


const WinTabMore: React.FC<{
    onRemoveCurrent: () => void, onRemoveAll: () => void,
    onRemoveOthers: () => void, onSelect: (tabId: number) => void;
    onRemove: (tabId: number) => void; onExchange: (tabID: number, toTabID: number) => void; tabs: IWinTab[];
    activeTabID: number;
    onOpen: (node: IDocsNodeBase) => void;
}> = function (props) {

    const { tabs, activeTabID, onRemove, onExchange, onSelect, onOpen } = props;
    const { t } = useTranslation();
    const [moreBarVisible, onMoreBarVisible] = useState(false)

    const onRemoveCurrent = () => {
        props.onRemoveCurrent();
    }

    const onRemoveAll = () => {
        props.onRemoveAll();
        onMoreBarVisible(false);
    }

    const onRemoveOthers = () => {
        props.onRemoveOthers();
        onMoreBarVisible(false)
    }

    const moreList =
        (<div className="more-nodes">
            <MenuItem name={t("editor.close")} icon={null} onClick={onRemoveCurrent} />
            <MenuItem name={t("editor.closeAllDocs")} icon={null} onClick={onRemoveAll} />
            <MenuItem name={t("editor.closeOtherDocs")} icon={null} onClick={onRemoveOthers} />
        </div>);

    const content =
        (<div className="opened-nodes">
            <WinOpenedList tabs={tabs} onSelect={onSelect} onRemove={onRemove} onOpen={onOpen} onExchange={onExchange} activeTabID={activeTabID} onRemoveAll={onRemoveAll}/>
        </div>);


    return <>
        <Popover overlayClassName='win-tab-more-popover' placement="bottom" open={moreBarVisible} onOpenChange={onMoreBarVisible} content={content} trigger="click" destroyTooltipOnHide={{ keepParent: false }}>
            <span className={["win-tab-bar__op win-tab-bar__op--more", moreBarVisible ? " active" : ""].join("")} ><MoreOutlined /></span>
        </Popover>
    </>
}
export default withTranslation()(WinTabMore)