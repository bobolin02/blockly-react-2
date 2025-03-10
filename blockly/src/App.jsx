import React, { useEffect, useRef } from 'react';
import $ from 'jquery';

const BlockMirrorEditor = () => {
  const editorRef = useRef(null);
  const blockMirrorEditorRef = useRef(null);

  useEffect(() => {
    const editor = new window.BlockMirror({
      container: editorRef.current,
      blocklyMediaPath: 'lib/blockly/media/',
      imageMode: true,
      imageDownloadHook: (oldUrl) => oldUrl,
      imageUploadHook: (blob) => Promise.resolve(`Image(${JSON.stringify(URL.createObjectURL(blob))})`),
      imageLiteralHook: (oldUrl) => `Image("${oldUrl}")`,
    });

    blockMirrorEditorRef.current = editor;

    console.log('Editor:', editor);
    console.log('Block Editor:', editor.blockEditor);
    console.log('Blockly Workspace:', editor.blockEditor.workspace);

    editor.addChangeListener((event) => {
      console.log('Change! Better save:', event);
    });

    editor.setCode('class X:\n    """Hello world"""\n    def add(self, a, b):\n        a = 0\n        return a\n\nx = X()\nx.add(5,3)');
    editor.setMode('split');

    window.Sk.configure({
      __future__: window.Sk.python3,
      read: (filename) => {
        if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][filename] === undefined) {
          throw new Error(`File not found: '${filename}'`);
        }
        return window.Sk.builtinFiles["files"][filename];
      },
    });

    return () => {};
  }, []);

  const runTests = () => {
    const TESTS = [
      'for ___ in ___:\n    pass',
      '0',
      '0\n0\n0\n0\n',
      // ... (完整的 TESTS 陣列)
      "'''\ntest'''",
    ];

    for (let i = 0; i < TESTS.length; i += 1) {
      let test = TESTS[i];
      blockMirrorEditorRef.current.textEditor.setCode(test, true);
      blockMirrorEditorRef.current.blockEditor.setCode(blockMirrorEditorRef.current.textEditor.getCode(), true);
      console.assert(
        test.trim() === blockMirrorEditorRef.current.textEditor.getCode().trim(),
        "\n預期:\n" + test.trim() + "\n",
        "\n實際:\n" + blockMirrorEditorRef.current.textEditor.getCode().trim() + "\n"
      );
      if (test.trim() !== blockMirrorEditorRef.current.textEditor.getCode().trim()) {
        break;
      }
      blockMirrorEditorRef.current.blockEditor.changed();
      blockMirrorEditorRef.current.blockEditor.setCode(blockMirrorEditorRef.current.textEditor.getCode(), true);
      console.assert(
        test.trim() === blockMirrorEditorRef.current.textEditor.getCode().trim(),
        "\n預期:\n" + test.trim() + "\n",
        "\n實際:\n" + blockMirrorEditorRef.current.textEditor.getCode().trim() + "\n(第二次)"
      );
      if (test.trim() !== blockMirrorEditorRef.current.textEditor.getCode().trim()) {
        break;
      }
    }
  };

  const handleSave = () => {
    const editor = blockMirrorEditorRef.current;
    const xmlDom = window.Blockly.Xml.workspaceToDom(editor.blockEditor.workspace);
    const xml = window.Blockly.Xml.domToText(xmlDom);
    const pythonCode = editor.textEditor.getCode();

    const workspaceData = {
      xml,
      python: pythonCode,
      timestamp: new Date().toISOString(),
    };

    console.log('Workspace saved locally:', workspaceData);
    alert('工作區已儲存到本地控制台！');
  };

  return (
    <>
      <div id="image-spot"></div>
      <div style={{ width: '900px', margin: '0 auto' }} id="example-frame">
        <button id="save-button" onClick={handleSave}>
          儲存工作區
        </button>
        <button id="go" onClick={runTests}>
          Run Tests
        </button>
        <div
          id="blockmirror-editor"
          ref={editorRef}
          style={{ display: 'flex', flexDirection: 'row', height: '480px' }}
        />
      </div>
    </>
  );
};

export default BlockMirrorEditor;