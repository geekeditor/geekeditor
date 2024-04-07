import md5 from 'blueimp-md5'
import { Base64 } from 'js-base64';
import { EDocsNodeType, IDocsIndex, IDocsIndexItem } from '../../../types/docs.d';
import { dateFormat } from '../../../utils/utils';
import { MarkdownToState, StateToMarkdown, tokenizer } from '@geekeditor/meditable';
import { MEBlockData } from '@geekeditor/meditable/dist/types/types/index.d';

declare type FileSystemFileHandle = any;
declare type FileSystemDirectoryHandle = any;

export async function writeFile(
    fileHandle: FileSystemFileHandle,
    contents: string | Blob,
    encode = false
) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await (fileHandle as any).createWritable();
    // Write the contents of the file to the stream.
    await writable.write(
        encode && typeof contents === "string"
            ? Base64.encode(contents)
            : contents
    );
    // Close the file and write the contents to disk.
    writable.close();
}

export const IndexSeperator = '$$_$$';

export function generateDirectoryID(path: string, prefix: string) {
    return prefix + '_' + md5(`${+ new Date()}${path}`)
}

export function joinPath(path: string, name: string, seperator = '/') {
    return path == '-1' || !path ? name : `${path}${seperator}${name}`
}


function convertBlockData(list: MEBlockData[]): IDocsIndexItem[] {
    return list.map((li) => {

        if (li.children && li.children.length) {
            const p = li.children[0];
            const ul = li.children[1]
            if (p.type === 'paragraph' && (!ul || ul.type === 'bullet-list')) {
                const token = tokenizer(p.text || '')[0] || {}
                const { type, raw, href, anchor: title, content, attrs } = token;
                let match:RegExpExecArray | null = null;
                if (type === 'text' || type === 'html_tag') {
                    const item: IDocsIndexItem = {
                        id: attrs?.id || generateUniqueId(),
                        type: EDocsNodeType.EDocsNodeTypeDir,
                        title: content,
                        children: !ul ? [] : convertBlockData(ul.children||[])
                    }

                    return item;
                } else if(type === 'link' && (match = /docs\/(.*)\.md$/.exec(href))) {
                    const item: IDocsIndexItem = {
                        id: match[1],
                        type: EDocsNodeType.EDocsNodeTypeDoc,
                        title,
                        children: !ul ? [] : convertBlockData(ul.children||[])
                    }
                    return item;
                }
            }
        }

        return null;
    }).filter((li) => !!li) as IDocsIndexItem[]

}

export function parseDocsIndex(content: string): IDocsIndex {
    const docsIndex: any = {
        created: 0,
        updated: 0,
        version: 0,
        id: '-1',
        type: EDocsNodeType.EDocsNodeTypeDir,
        title: ''
    }

    if (content) {
        const markdownToState = new MarkdownToState()
        const data = markdownToState.generate(content)
        data.children?.forEach((child) => {
            if (child.type === 'frontmatter') {
                const list = child.text?.split("\n");
                if (list) {
                    list.forEach((li) => {
                        const keyValue = li.split(":");
                        if (keyValue.length === 2) {
                            const key = keyValue[0].trim();
                            const value = keyValue[1].trim();
                            if (docsIndex[key] !== undefined) {
                                docsIndex[key] = parseInt(value)
                            }
                        }
                    })
                }
            } else if (child.type === 'bullet-list' && child.children) {
                docsIndex.children = convertBlockData(child.children)
            }
        })
    }

    docsIndex.children = docsIndex.children || []
    return docsIndex
}

function convertDocsIndex(items: IDocsIndexItem[]): MEBlockData {
    const children: MEBlockData[] = items.map((item) => {
        const child: MEBlockData = {
            id: '',
            type: 'list-item',
            children: [
                {
                    id: item.id,
                    type: 'paragraph',
                    text: item.type === EDocsNodeType.EDocsNodeTypeDir ? `<span id="${item.id}">${item.title}</span>` : `[${item.title}](docs/${item.id}.md)`
                }
            ]
        }

        if (item.children?.length) {
            const subChild = convertDocsIndex(item.children);
            child.children?.push(subChild)
        }
        return child;
    })
    return {
        id: '',
        type: 'bullet-list',
        meta: {
            marker: '-'
        },
        children
    };
}

export function stringifyDocsIndex(docsIndex: IDocsIndex): string {
    const stateToMarkdown = new StateToMarkdown()
    const data: MEBlockData[] = [];
    data.push({
        id: '',
        type: "frontmatter",
        meta: {
            lang: 'yaml'
        },
        text: `created: ${docsIndex.created}\nupdated: ${docsIndex.updated}\nversion: ${docsIndex.version}`
    })
    const list: MEBlockData = convertDocsIndex(docsIndex.children)
    data.push(list)
    const markdown = stateToMarkdown.generate(data)
    return markdown
}

export function generateUniqueId() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 4 characters
    // after the decimal.
    const date = dateFormat('YYYY-MM-dd-HH-mm-ss', new Date());
    return `${date}-${Math.random().toString(36).substring(2, 6)}`;
};


export function findChildren(id: any, children: IDocsIndexItem[]): IDocsIndexItem | undefined {
    let find: IDocsIndexItem | undefined = undefined;
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.id === id) {
            find = child;
        } else if (child.children) {
            find = findChildren(id, child.children)
        }

        if (find) {
            break;
        }
    }

    return find;
}


export function removeChild(id: any,  parent: IDocsIndexItem): {child: IDocsIndexItem, parent: IDocsIndexItem, index: number} | undefined {
    let find: {child: IDocsIndexItem, parent: IDocsIndexItem, index: number} | undefined = undefined;
    const children = parent.children || []
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.id === id) {
            find = {child, parent, index: i};
            children.splice(i, 1)
        } else if (child.children) {
            find = removeChild(id, child)
        }

        if (find) {
            break;
        }
    }

    return find;
}