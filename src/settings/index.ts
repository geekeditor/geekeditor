import Settings from './Settings'

let settingsInstance: any = Settings.newInstance();
const settings = {
    open(options?: { key?: string }) {
        if (!!!settingsInstance) {
            settingsInstance = Settings.newInstance();
        }

        settingsInstance.open(options);
    },
    close() {
        if (!!settingsInstance) {
            settingsInstance.close();
        }
    }
}

export default settings;