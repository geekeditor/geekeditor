import React from 'react'
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons"
// import { useTranslation } from 'react-i18next';


const WinTabStack: React.FC<{ onBack: () => void; onNext: () => void; canBack: boolean; canNext: boolean }> = function (props) {
    // const { t } = useTranslation();
    const {onBack, canBack, onNext, canNext} = props;
    
    return <>
        <span className={["win-tab-bar__op", !canBack ? " win-tab-bar__op--disabled" : ""].join("")} onClick={onBack}>{<ArrowLeftOutlined />}</span><span className={["win-tab-bar__op", !canNext ? " win-tab-bar__op--disabled" : ""].join("")} onClick={onNext}><ArrowRightOutlined /></span>
    </>
}
export default WinTabStack