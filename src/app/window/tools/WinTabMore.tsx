import React, { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { MoreOutlined } from "@ant-design/icons"
import { IDocsNodeBase } from "../../../types/docs.d";
import sharedEventBus from "../../../utils/sharedEventBus";
import { Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import MenuItem from '../../../widgets/MenuItem';
import i18n from '../../../i18n';


const WinTabMore: React.FC<{ onRemoveAll: () => void,
    onRemoveOthers: () => void, }> = function (props) {
    const { t } = useTranslation();
    const [moreBarVisible, onMoreBarVisible] = useState(false)

    const onRemoveAll = ()=>{
        props.onRemoveAll();
        onMoreBarVisible(false);
    }

    const onRemoveOthers = ()=>{
        props.onRemoveOthers();
        onMoreBarVisible(false)
    }

    const onAdd = () => {
        onMoreBarVisible(false)
        sharedEventBus.trigger('onAdd');
    }

    const moreList =
        (<div className="more-nodes">
            {/* <MenuItem name={i18n.t("editor.newOrOpen")} icon={null} onClick={onAdd} /> */}
            <MenuItem name={i18n.t("editor.closeAllDocs")} icon={null} onClick={onRemoveAll} />
            <MenuItem name={i18n.t("editor.closeOtherDocs")} icon={null} onClick={onRemoveOthers} />
        </div>);

    
    return <>
        <Popover placement="bottom" open={moreBarVisible} onOpenChange={onMoreBarVisible} content={moreList} trigger="click" destroyTooltipOnHide={{ keepParent: false }}>
            <span className={["win-tab-bar__op win-tab-bar__op--more", moreBarVisible ? " active" : ""].join("")} ><MoreOutlined /></span>
        </Popover>
    </>
}
export default WinTabMore