import { QuestionCircleOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { useEffect, useState } from "react";
import BarItem from "../widgets/BarItem";
import guide from "./guide";

export default function AppGuide() {

    const [showGuideTip, setShowGuideTip] = useState(false);
    
    const onOpenGuide = () => {
        setShowGuideTip(false);
        guide.onEnterGuide();
    }

    useEffect(()=>{
        const triggerShowGuideTip = () => {

            setShowGuideTip(true);

            setTimeout(()=>{
                setShowGuideTip(false)
            }, 3000)

            document.removeEventListener('mousemove', triggerShowGuideTip)
        }
        document.addEventListener('mousemove', triggerShowGuideTip)
    }, [])


    return <Popover placement="topRight" content="查看操作引导帮助" visible={showGuideTip}><BarItem icon={<QuestionCircleOutlined />} wrapClassName="app-bar-item" onClick={onOpenGuide}/></Popover>

}