import { PushpinFilled, PushpinOutlined } from "@ant-design/icons"
import { useState } from "react"
import { setAlwaysOnTop } from "../utils/utils"
import BarItem from "../widgets/BarItem"

export default function AppOnTop() {

    const [alwaysOnTop, setOnTop] = useState(false)

    const onAlwaysOnTopToggle = () => {
        setAlwaysOnTop(!alwaysOnTop).then((isAlwaysOnTop)=>{
            setOnTop(isAlwaysOnTop)
        })
    }

    return <BarItem id="app-guide-alwaystop" icon={alwaysOnTop ? <PushpinFilled /> : <PushpinOutlined />} wrapClassName="app-bar-item" onClick={onAlwaysOnTopToggle} selected={alwaysOnTop}/> 

}