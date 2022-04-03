import EditorJS from '@editorjs/editorjs';
import Checklist from '@editorjs/checklist'
import Code from './CodeTool'
import InlineCode from '@editorjs/inline-code'
import Delimiter from '@editorjs/delimiter'
import Embed from '@editorjs/embed'
import Header from '@editorjs/header'
import Image from '@editorjs/image'
import Link from '@editorjs/link'
import List from '@editorjs/list'
import Marker from '@editorjs/marker'
import NestedList from '@editorjs/nested-list'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Raw from '@editorjs/raw'
import Table from '@editorjs/table'
import Undo from 'editorjs-undo'
import Warning from '@editorjs/warning'

window.initEditor = async function(id, { html = '', blocks = '' }) {
  const editor = new EditorJS({
    /**
     * Id of Element that should contain Editor instance
     */
    holder: id,

    data: blocks && JSON.parse(blocks),

    minHeight: 75,

    tools: {
      header: {
        class: Header,
        inlineToolbar: true
      },
      list: List,
      checklist: Checklist,
      code: Code,
      inlineCode: InlineCode,
      delimiter: Delimiter,
      embed: Embed,
      link: {
        class: Link,
        inlineToolbar: true
      },
      nestedList: NestedList,
      paragraph: {
        class: Paragraph,
        inlineToolbar: true
      },
      quote: Quote,
      table: Table,
    },

    onReady() {
      new Undo({ editor });
    }
  });

  await editor.isReady

  if (html) {
    editor.blocks.renderFromHTML(html)
  }

}
