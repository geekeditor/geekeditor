import { DesktopOutlined } from "@ant-design/icons";
import { appDownloadUrl } from "../utils/utils";
import BarItem from "../widgets/BarItem";

export default function AppDownload() {

    const onDownload = () => {
        window.open(appDownloadUrl, '_blank')
    }

    return <BarItem id="app-guide-desktop" icon={<DesktopOutlined />} wrapClassName="app-bar-item" tip="安装浏览器扩展" placement="right" onClick={onDownload}/>
}