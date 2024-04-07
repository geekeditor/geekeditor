import CryptoJS from "crypto-js"


export function encrypt(text: string, secretKey: string) {
    return CryptoJS.AES.encrypt(text, secretKey).toString()
}

export function decrypt(cipherText: string, secretKey: string) {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8)
}

export function getCanvasFingerprint() {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext("2d");
    if (context) {
        context.font = "18pt Arial";
        context.textBaseline = "top";
        context.fillText("GeekEditor", 2, 2);
        return CryptoJS.MD5(canvas.toDataURL("image/jpeg")).toString();
    }

    return `geekeditor`
}