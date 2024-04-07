export function readFile(file: File | Blob) {
    return new Promise<undefined | { content: string; name: string; path: string; source: string }>((resolve) => {
        const date = new Date();
        const path =
            date.getFullYear() +
            "-" +
            (date.getMonth() + 1) +
            "-" +
            date.getDate();
        const reader = new FileReader();
        reader.readAsDataURL(file);
        const match = file.type.match(/image\/(.*)/);
        const type = match ? match[1] : 'jpg'
        const source = (file as any).path || ''
        reader.onload = (e) => {
            if (e.target && e.target.result && typeof e.target.result === 'string') {
                const content = e.target.result.split(',').pop() || '';
                let name = `${+date}-${((file as File).name || `image`)}`;
                const regex = new RegExp(`\.${type}$`)
                type && !regex.test(name) && (name = `${name}.${type}`);
                return {
                    content,
                    name,
                    path,
                    source
                }
            } else {
                resolve(undefined)
            }
        }

    });
}

const isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows")

function getSeperator():string {
    return isWin ? '\\' : '/';
}

export const seperator = getSeperator();