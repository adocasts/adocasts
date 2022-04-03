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

(async () => {

  const bodyTypeId = document.querySelector('input[name=bodyTypeId]').value
  const body = document.querySelector('input[name=body]').value
  const bodyBlocks = document.querySelector('input[name=bodyBlocks]').value

  const editor = new EditorJS({
    /**
     * Id of Element that should contain Editor instance
     */
    holder: 'editorjs',

    data: JSON.parse(bodyBlocks),

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
      image: Image,
      link: {
        class: Link,
        inlineToolbar: true
      },
      marker: {
        class: Marker,
        inlineToolbar: true
      },
      nestedList: NestedList,
      paragraph: {
        class: Paragraph,
        inlineToolbar: true
      },
      quote: Quote,
      raw: Raw,
      table: Table,
      warning: Warning,
    },

    onReady() {
      new Undo({ editor });
    }
  });

  await editor.isReady

  if (body && bodyTypeId == 1) {
    editor.blocks.renderFromHTML(body)
  }

  window.editor = editor

})();
