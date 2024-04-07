import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons"
import { useState } from "react"
import BarItem from "../../../widgets/BarItem"
import './WinTabZen.less'
import sharedEventBus from "../../../utils/sharedEventBus";


class Zen {

    private on = false;
    private timeout:any = 0;

    constructor() {

        this.removeZenMode = this.removeZenMode.bind(this);

    }

    get zen() {
        return this.on;
    }

    toggleZen(on: boolean) {

        this.on = on;

        if(on) {
            sharedEventBus.trigger('onTriggerFullscreen', true)
            this.enterZenModeDelay();
            document.addEventListener('mousemove', this.removeZenMode);

        } else {
            clearTimeout(this.timeout);
            document.removeEventListener('mousemove', this.removeZenMode)
        }

    }

    removeZenMode() {
        document.documentElement.classList.remove('zen');
        if(this.on) {
            this.enterZenModeDelay()
        }
    }

    enterZenModeDelay() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(()=>{

            document.documentElement.classList.add('zen');

        }, 3000)
    }
}

const zen = new Zen();


export default function WinTabZen() {
    const [zenMode, setZenMode] = useState(zen.zen)
    const onZenModeToggle = () => {

        setZenMode(!zenMode);
        zen.toggleZen(!zenMode);
    }

    return <BarItem selected={zenMode} icon={zenMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />}  wrapClassName="win-tab-status-bar-item" onClick={onZenModeToggle}/>
}