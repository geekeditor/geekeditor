import { AimOutlined } from "@ant-design/icons"
import { useState } from "react"
import BarItem from "../../../widgets/BarItem"
import MEditable from "@geekeditor/meditable"



export default function WinTabFocusMode() {
    const [focusMode, setFocusMode] = useState(!!MEditable.defaultOptions.focusMode)
    const onFocusModeToggle = () => {

        setFocusMode(!focusMode);
        MEditable.configDefaultOptions({focusMode: !focusMode})
    }

    return <BarItem selected={focusMode} icon={<AimOutlined />}  wrapClassName="win-tab-status-bar-item" onClick={onFocusModeToggle}/>
}