import { SettingOutlined } from "@ant-design/icons";
import settings from "../settings";
import BarItem from "../widgets/BarItem";

export default function AppSettings() {

    const onOpenSettings = () => {
        settings.open();
    }

    return <BarItem id="app-guide-setting" icon={<SettingOutlined />} wrapClassName="app-bar-item" onClick={onOpenSettings} />
}