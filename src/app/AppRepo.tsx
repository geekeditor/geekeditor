import { SisternodeOutlined } from "@ant-design/icons";
import { useRef } from "react";
import BarItem from "../widgets/BarItem";
import DocsProviderAdd from '../docs/DocsProviderAdd'
import { useTranslation } from "react-i18next";

export default function AppRepo() {

    const { t } = useTranslation()

    let provider = useRef<DocsProviderAdd>(null)

    const onAddDocRepo = () => {
        if(provider.current) {
            provider.current.show()
        }
    }

    return <><BarItem id="app-guide-new" icon={<SisternodeOutlined />} onClick={onAddDocRepo}  tip={t("settings.addRepository")} placement="bottom" wrapClassName="app-bar-item" /><DocsProviderAdd ref={provider}/></>
}