import { FileGifOutlined, FileImageOutlined, FileMarkdownOutlined, FileTextOutlined, FileUnknownOutlined } from "@ant-design/icons"

export function getExtensionIcon(extension: string) {
    extension = extension.toLowerCase()
    if(extension === '.md') {
        return <FileMarkdownOutlined />
    } else if(extension === '.gif') {
        return <FileGifOutlined />
    } else if(extension === '.png' || extension === 'jpg') {
        return <FileImageOutlined />
    } else if(extension === '.html' || extension === '.js' || extension === '.css') {
        return <FileTextOutlined />
    }

    return <FileUnknownOutlined />
}


export const DocsifyIndex = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>docsify</title>
    <link rel="icon" href="_media/favicon.ico" />
    <meta
      name="google-site-verification"
      content="6t0LoIeFksrjF4c9sqUEsVXiQNxLp2hgoqo0KryT-sE"
    />
    <meta
      name="keywords"
      content="doc,docs,documentation,gitbook,creator,generator,github,jekyll,github-pages"
    />
    <meta name="description" content="A magical documentation generator." />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, minimum-scale=1.0"
    />
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"
      title="vue"
    />
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/dark.css"
      title="dark"
      disabled
    />
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/buble.css"
      title="buble"
      disabled
    />
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/pure.css"
      title="pure"
      disabled
    />
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/dolphin.css"
      title="dolphin"
      disabled
    />
    <style>
      nav.app-nav li ul {
        min-width: 100px;
      }
    </style>
    <script>
      (function () {
        const lang = location.hash.match(/#\/(zh-cn)\//);

        // Set html "lang" attribute based on URL
        if (lang) {
          document.documentElement.setAttribute('lang', lang[1]);
        }
      })();
    </script>
  </head>

  <body>
    <div id="app">Loading ...</div>
    <script>
      // Docsify configuration
      // Guide: https://docsify.js.org
      window.$docsify = {
        alias: {
          '/.*/_navbar.md': '/_navbar.md',
          // '/zh-cn/(.*)': 'https://cdn.jsdelivr.net/gh/docsifyjs/docs-zh@master/$1', // Custom
        },
        auto2top: true,
        coverpage: true,
        executeScript: true,
        loadSidebar: true,
        loadNavbar: true,
        mergeNavbar: true,
        maxLevel: 4,
        subMaxLevel: 2,
        name: 'docsify',
        nameLink: {
          '/zh-cn/': '#/zh-cn/',
          '/': '#/',
        },
        search: {
          noData: {
            '/zh-cn/': '没有结果!',
            '/': 'No results!',
          },
          paths: 'auto',
          placeholder: {
            '/zh-cn/': '搜索',
            '/': 'Search',
          },
          pathNamespaces: ['/zh-cn'],
        },
        skipLink: {
          '/zh-cn/': '跳到主要内容',
        },
        plugins: [
          function (hook, vm) {
            hook.beforeEach(html => {
              return (
                html +
                '\\n\\n----\\n\\n' +
                '<a href="https://www.geekeditor.com" target="_blank" style="color: inherit; font-weight: normal; text-decoration: none;">Edit by GeekEditor</a>'
              );
            });
          },
        ],
      };
    </script>
    <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js"></script>
    <!-- Highlight code -->
    <!-- <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-markdown.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-nginx.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-php.min.js"></script> -->
  </body>
</html>
`

export const DocsifyReadme = `
## GeekEditor

> **GeekEditor v2.0** is a WYSIWYG markdown syntax writing editor with quick typesetting to export.
`

export const DocsifyCoverPage = `
![logo]()

# GeekEditor <small>v2.0</small>

> A magical markdown editor

- Data is private, not require image bed
- Markdown format, WYSIWYG
- Theme layout, custom style

[Github](https://github.com/geekeditor)
[Getting Started](#geekeditor)
`

export const DocsifyNavbar = `
- Translations
  - [:uk: English](/)
  - [:cn: 简体中文](/zh-cn/)
`

export const DocsifySideBar = `
- Getting started
`