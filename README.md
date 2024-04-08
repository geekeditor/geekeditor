**Geek Editor v2.0** is an open-source, free WYSIWYG Markdown writing and typesetting editor, as well as a note-taking tool based on real-time storage in the GitHub/Gitee/GitLab repository. Currently, the Web App code has been fully open-source: [GeekEditor](https://github.com/geekeditor/geekeditor). The Markdown editor used in it has also been open-source: [MEditable](https://github.com/geekeditor/meditable). Welcome Star!

## 1. Features

#### 1.1 Data is private, not require image bed

It supports real-time storage on local disks and `GitHub/Getee/GatLab` repositories, with images automatically uploaded and saved to the repositories. It is also possible to take rich text notes without configuring an independent image bed. What's more, it supports dragging images to the editor.

Public repositories can be used to store public columns for readers to read; Private repositories can be used to store private notes. If you want to destroy all documents, you can clear them with just one click, allowing for free management, migration, and deletion.

Data is private, storage is free, and long-term storage of content is not disconnected. For highly private content, the editor will support setting password encryption storage.

#### 1.2 Markdown format, WYSIWYG

The document is stored in plain text Markdown syntax format and can be easily migrated to other platforms.

Using WYSIWYG editing method, it supports CommonMark and GFM (GitHub Flavored Markdown) standards, as well as mathematical expressions (KaTeX), charts (Mermaid/Flowchart/Vegas/Plantuml), Frontmeta, Emoji, and other extensions.

The editor adheres to simplicity and efficiency, with only commonly used key function buttons placed on the interface. For long writing, the editor will continue to optimize its interaction.

#### 1.3 Virtual directory, flattened physical storage

The physical storage of documents is flat. The directory structure is presented in a non physical manner, using an index.md document to store the directory structure tree. Markdown documents and image resources are stored in separate physical folders. There are the following physical files and folders in the warehouse:

- index.md: Stores the directory structure of user created documents

- docs：Stores markdown documents

- assets：Store image resources

#### 1.4 Theme layout, custom style

Separate writing and typesetting. After writing, you can customize the layout and export it. The editor has multiple built-in layout themes, and CSS layout themes can also be customized.

#### 1.5 Multi format export, quick distribution

It supports the export of Image, PDF, HTML, Textbundle, Markdown, TXT and other format documents, and supports the synchronization of articles to the official account.

#### 1.6 Backup encryption configuration

Support password encryption configuration backup to local or cloud, facilitating cross device writing.

## 2. Development

```sh
# step1: install dependencies
npm install --legacy-peer-deps
# step2: run the development codes
npm start
```

## 3. Build

```sh
npm run build:release
```
