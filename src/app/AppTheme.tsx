import { useEffect, useState } from "react";
import sharedPreferences from "../utils/sharedPreferences";
import sharedPreferencesKeys from "../utils/sharedPreferencesKeys";
import BarItem from "../widgets/BarItem";

const dayModeIcon = <svg viewBox="0 0 1024 1024" version="1.1" width="16" height="16" fill="currentColor">
            <path d="M512.001 297.072c-118.511 0-214.929 96.418-214.929 214.93 0 118.509 96.418 214.926 214.929 214.926 118.509 0 214.927-96.416 214.927-214.926 0-118.512-96.418-214.93-214.927-214.93z m0 371.777c-86.485 0-156.85-70.362-156.85-156.847 0-86.49 70.365-156.853 156.85-156.853s156.848 70.363 156.848 156.853c0 86.485-70.363 156.847-156.848 156.847zM512.001 261.715c16.017 0 29.042-13.027 29.042-29.039V93.017c0-16.012-13.026-29.039-29.042-29.039-16.009 0-29.036 13.027-29.036 29.039v139.659c-0.001 16.012 13.027 29.039 29.036 29.039zM512.001 762.282c-16.009 0-29.036 13.027-29.036 29.039v139.665c0 16.011 13.027 29.036 29.036 29.036 16.017 0 29.042-13.026 29.042-29.036V791.321c0-16.012-13.026-29.039-29.042-29.039zM261.716 512.002c0-16.012-13.027-29.038-29.041-29.038H93.014c-16.009 0-29.036 13.026-29.036 29.038s13.027 29.039 29.036 29.039h139.662c16.013 0.001 29.04-13.027 29.04-29.039zM930.986 482.964H791.32c-16.008 0-29.035 13.026-29.035 29.038s13.027 29.039 29.035 29.039h139.666c16.009 0 29.036-13.027 29.036-29.039s-13.027-29.038-29.036-29.038zM258.7 299.807c5.503 5.446 12.78 8.451 20.484 8.463h0.049c7.768-0.012 15.048-3.027 20.502-8.485 5.481-5.479 8.5-12.771 8.5-20.532 0-7.762-3.019-15.054-8.5-20.532l-93.104-93.104c-5.476-5.479-12.769-8.497-20.53-8.497-7.764 0-15.055 3.018-20.532 8.497-11.317 11.325-11.317 29.741 0 41.057l93.131 93.133zM279.206 715.764c-7.761 0-15.052 3.018-20.529 8.497l-93.109 93.109c-11.317 11.319-11.317 29.738 0.023 41.081 5.506 5.448 12.78 8.452 20.487 8.464h0.042c7.771-0.012 15.057-3.025 20.511-8.487l93.104-93.107c5.481-5.476 8.5-12.769 8.5-20.529 0-7.764-3.019-15.055-8.5-20.532-5.477-5.479-12.764-8.496-20.529-8.496zM765.277 724.261c-5.479-5.479-12.772-8.497-20.532-8.497-7.761 0-15.049 3.018-20.526 8.497-5.481 5.478-8.5 12.771-8.5 20.532 0 7.762 3.019 15.052 8.5 20.526l93.128 93.133c5.506 5.446 12.778 8.452 20.487 8.464h0.045c7.765-0.012 15.049-3.025 20.506-8.487 11.317-11.323 11.317-29.741 0-41.059l-93.108-93.109zM744.723 308.269h0.052c7.756-0.012 15.037-3.027 20.502-8.485l93.109-93.11c11.317-11.316 11.317-29.735 0-41.057-5.479-5.479-12.771-8.497-20.531-8.497s-15.052 3.018-20.529 8.497l-93.106 93.104c-5.481 5.479-8.5 12.771-8.5 20.532 0 7.762 3.019 15.055 8.518 20.55 5.496 5.445 12.773 8.454 20.485 8.466z"></path></svg>
        const darkModeIcon = <svg viewBox="0 0 1024 1024" version="1.1" width="16" height="16" fill="currentColor">
            <path d="M426.666667 85.333333c-77.653333 0-150.613333 21.333333-213.333334 57.6C340.906667 216.746667 426.666667 354.133333 426.666667 512s-85.76 295.253333-213.333334 369.066667C276.053333 917.333333 349.013333 938.666667 426.666667 938.666667c235.52 0 426.666667-191.146667 426.666666-426.666667S662.186667 85.333333 426.666667 85.333333z" p-id="1968"></path></svg>
export default function AppTheme() {

    const [darkMode, setDarkMode] = useState(!!sharedPreferences.getSetting('darkmode'))

    const onDarkModeToggle = () => {
        const documentElement = document.documentElement;
        documentElement.classList.toggle('dark-mode', !documentElement.classList.contains('dark-mode'))
        setDarkMode(documentElement.classList.contains('dark-mode'))
        sharedPreferences.setSetting(sharedPreferencesKeys.kSettingsDarkmode, documentElement.classList.contains('dark-mode'))
    }

    useEffect(()=>{

        sharedPreferences.ready(()=>{
            const darkMode = !!sharedPreferences.getSetting(sharedPreferencesKeys.kSettingsDarkmode);
            setDarkMode(darkMode);
            const documentElement = document.documentElement;
            documentElement.classList.toggle('dark-mode', darkMode);
        })

    }, [])

    return <BarItem id="app-guide-darkmode" icon={darkMode ? dayModeIcon : darkModeIcon} wrapClassName="app-bar-item" onClick={onDarkModeToggle}/>
}