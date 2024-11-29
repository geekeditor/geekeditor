import { useTranslation } from "react-i18next";
import BarItem from "../widgets/BarItem";
import { useEffect, useState } from "react";
const InstallIcon = <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14866" width="16" height="16"><path d="M384 896a41.173333 41.173333 0 0 1-30.378667-12.288A41.173333 41.173333 0 0 1 341.333333 853.333333v-42.666666H170.666667c-23.466667 0-43.52-8.362667-60.245334-25.045334A82.218667 82.218667 0 0 1 85.333333 725.333333V213.333333c0-23.466667 8.362667-43.562667 25.088-60.288A82.133333 82.133333 0 0 1 170.666667 128h341.333333v85.333333H170.666667v512h682.666666v-128h85.333334v128c0 23.466667-8.362667 43.562667-25.045334 60.288A82.261333 82.261333 0 0 1 853.333333 810.666667h-170.666666v42.666666c0 12.074667-4.096 22.186667-12.245334 30.378667A41.301333 41.301333 0 0 1 640 896H384z m341.333333-316.8a46.933333 46.933333 0 0 1-16-2.688 37.162667 37.162667 0 0 1-13.866666-9.045333l-153.6-153.6a41.642667 41.642667 0 0 1-12.245334-29.354667 39.594667 39.594667 0 0 1 12.245334-30.378667 40.448 40.448 0 0 1 29.866666-11.733333c12.074667 0 22.058667 3.925333 29.866667 11.733333l81.066667 80V170.666667c0-12.074667 4.096-22.229333 12.288-30.421334A41.258667 41.258667 0 0 1 725.333333 128c12.074667 0 22.186667 4.096 30.378667 12.245333 8.192 8.192 12.288 18.346667 12.288 30.421334v263.466666L849.066667 354.133333a41.728 41.728 0 0 1 29.312-12.288 39.808 39.808 0 0 1 30.421333 12.288 40.448 40.448 0 0 1 11.733333 29.866667 40.448 40.448 0 0 1-11.733333 29.866667l-153.6 153.6c-4.266667 4.266667-8.874667 7.253333-13.866667 9.045333a46.933333 46.933333 0 0 1-16 2.688z" fill="currentColor"></path></svg>;
export default function AppSettings() {

    const [showInstall, setShowInstall] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    const { t } = useTranslation()

    useEffect(()=>{
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            // this.deferredPrompt = e;
            setDeferredPrompt(e);
            setShowInstall(true);
        });
    }, [])

    const installPWA = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    setShowInstall(false);
                }
            });
        }

    }

    return <>{showInstall && <BarItem id="app-guide-setting" icon={InstallIcon} tip={t("landing.appInstallTips")} placement="bottom" wrapClassName="app-bar-item" onClick={installPWA} />}</>
}