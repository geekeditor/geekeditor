import factory from "./docs/docsprovider/DocsProviderFactory";
import { blobToDataURI } from "./utils/utils";



const data:any = {}
const proxy:any = {
    set(key: string, value: any) {
        data[key] = value;
    },
    get(key: string) {
        return data[key];
    },
    downloadDocAsset(asset: {assetRepo: string; assetDoc: string; assetName: string}) {
        return factory.loadAsset(asset.assetRepo, asset.assetDoc, asset.assetName).then(blobToDataURI)
    }
}
export default proxy;