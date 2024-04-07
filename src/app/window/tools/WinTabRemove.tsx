import React, { useState } from 'react'
import { CloseOutlined, MoreOutlined } from "@ant-design/icons"
import { Popover } from 'antd';
import MenuItem from '../../../widgets/MenuItem';


const WinTabRemove: React.FC<{
    onRemoveCurrent: () => void,
    onRemoveAll: () => void,
    onRemoveOthers: () => void,
}> = function (props) {

    const [closeBarVisible, onCloseBarVisible] = useState(false)

    const onRemoveAll = ()=>{
        props.onRemoveAll();
        onCloseBarVisible(false);
    }

    const onRemoveOthers = ()=>{
        props.onRemoveOthers();
        onCloseBarVisible(false)
    }


    const closeList =
        (<div className="close-nodes">
            <MenuItem name="关闭所有文档" icon={null} onClick={onRemoveAll} />
            <MenuItem name="关闭其它文档" icon={null} onClick={onRemoveOthers} />
        </div>);

    return <span className={["win-tab-bar__op", "win-tab-bar__op--remove"].join(' ')}>
        <span className="win-tab-bar__op" onMouseDown={props.onRemoveCurrent}> <CloseOutlined /></span>
        {/* <Popover placement="bottom" open={closeBarVisible} onOpenChange={onCloseBarVisible} content={closeList} trigger="click" destroyTooltipOnHide={{ keepParent: false }}>
            <span className="win-tab-bar__op win-tab-bar__op--removeAll"><MoreOutlined /></span>
        </Popover> */}
    </span>
}
export default WinTabRemove