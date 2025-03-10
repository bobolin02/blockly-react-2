import React, { useEffect, useRef } from 'react';

const BlockMirrorEditor = () => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    if (!window.BlockMirror || !window.Blockly || !window.Sk) {
      console.error('Required libraries (BlockMirror, Blockly, Skulpt) are not loaded.');
      return;
    }

    isInitialized.current = true;

    const editor = new window.BlockMirror({
      container: containerRef.current,
      blocklyMediaPath: '/lib/blockly/media/',
      imageMode: true,
      imageDownloadHook: (oldUrl) => oldUrl,
      imageUploadHook: (blob) => Promise.resolve(`Image(${JSON.stringify(URL.createObjectURL(blob))})`),
      imageLiteralHook: (oldUrl) => `Image("${oldUrl}")`,
    });

    editorRef.current = editor;

    // 設置初始程式碼
    editor.setCode("n = ___\n\nint(___)\n___ == ___\n___ % ___\nprint(___)\n\nn\n0\n2\n\"'{n} is not an even number.\"\nprint(___)\n\n\"'{n} is an even number.\"\nif ___:\n    pass\nelse:\n    pass\n\ninput()");
    editor.setMode('split');

    // 配置 Skulpt
    window.Sk.configure({
      __future__: window.Sk.python3,
      read: (filename) => {
        if (
          window.Sk.builtinFiles === undefined ||
          window.Sk.builtinFiles['files'][filename] === undefined
        ) {
          throw new Error(`File not found: '${filename}'`);
        }
        return window.Sk.builtinFiles['files'][filename];
      },
    });

    // 添加變更監聽器
    editor.addChangeListener((event) => {
      console.log('Change! Better save:', event);
    });

    // 定義 runTests 函數，內部訪問 editor
    const runTests = () => {
      const TESTS = [
        'for ___ in ___:\n    pass',
        '0',
        '0\n0\n0\n0\n',
        'for ___ in ___:\n    0\n    0',
        'for x in y:\n    pass',
        '1 + 1',
        '(1 * 3 + 4) + 6 & 8',
        '(1 + 2) - (3 * 4) / 5 | 7 & (8 % 9 << 10) >> 11 // 12',
        'not 4',
        '+1\n-2\n~4\nnot 5\nnot not not 4',
        '1 or 2',
        '1 and 2 and 3 or 4 and 5 or 3 or 4',
        '1 < 5',
        '(2 < 3) < 4',
        '(((4 > 3) < 2) > 2) < 2',
        '5 is 4',
        '___ in ___',
        '3 is not 4',
        '(1 is 2) is 3',
        '(((((((1 == 2) != 3) <= 4) >= 5) in 3) not in 3) is 4) is not 5',
        '1 < 2 and 3 < 4',
        'assert (1 < 2)',
        'assert (1 > 4), ___',
        '"Hello \'world.\'"',
        "'Hello \"there.\"'",
        'alpha\nbeta\ngamma',
        'alpha\nalpha\nalpha',
        'True\nFalse\nNone',
        '[]\n[1, 2, 3]\n[1, 2, 4, 5]\n()\n(1, 2, 3)\n(1, 2)\n(1, )\n(1, 2, 3, 4, 5)',
        '{1, 2, 3}\n{1}\n{4, 5, 6, 7}',
        "{1: 2, 'Hello': 'World'}\n{}",
        '{*{}}',
        "0 if True else False",
        "dog.growl\nalpha.beta.gamma\n'Test'.save",
        'alpha\nalpha(1)\nbeta(2)\nbeta',
        'alpha(beta)\nalpha.beta(gamma)\nhello(1, 2, 3)\nfor a in b:\n    (corgi(run))',
        'sorted([1, 2, 3], reverse=True)',
        'complex(1, 2, *first, *second, **big, **dog, third=3, fourth=4)',
        "raise\nraise Exception()\nraise Exception() from wherever",
        "del alpha\ndel alpha, beta, gamma",
        "simple[0]\nranged[1:2]\nranged[:2]\nranged[1:]\nranged[:]",
        "ranged[::3]\nranged[1::3]\nranged[:2:3]\nranged[1:2:3]",
        "df[1:2, 4]\ndf[1, 2, 3, 4]\ndf[6::7, 4:6, 5, 1:]",
        "[x for a in b if c]\n[x for a in b for c in d if e if g]",
        "{x for a in b if c}\n{x for a in b for c in d if e if g]",
        "(x for a in b if c)\n(x for a in b for c in d if e if g]",
        "{x: y for a in b if c}\n{x: y for a in b for c in d if e if g}",
        "a = 0\na = b = c = 0",
        "(a, b) = (1, 2)\n[x, (y, z)] = something",
        "i: int = 0\ns: str = 'Hello'\nf: float = 4.3\nb: bool = True\nx: Z = 4",
        "i: 'int' = 0\ns: 'str' = 'Hello'\nf: 'float' = 4.3\nb: 'bool' = True",
        "n: None = None\na[0]: List[int] = 0\nb: Dict[str, str]",
        'a += 1\nb *= 4\nc **= 4\nd ^= 10',
        `def alpha(beta, gamma, delta):\n    pass`,
        `def alpha(beta: str, gamma=True, delta: int=0):\n    pass`,
        `@route\n@open('test')\ndef alpha(beta: str, gamma=True, delta: int=0):\n    pass`,
        `@route\n@open('test')\ndef alpha(beta: str, gamma=True, delta: int=0, *args, k=4, num: int=3, **kwargs):\n    a = 0\n    b = 7`,
        "def do_something(a: int) -> str:\n    assert (4 == 3)",
        'lambda x, y=0: x + y',
        '(lambda : None)()',
        "def simple(a, b, c) -> int:\n    return 'Hello world!'\n    return",
        "def simple(a, b, c) -> int:\n    (yield 'Hello world!')\n    (yield)\n    dog = yield b + 4",
        "def simple(a, b, c) -> int:\n    (yield from 'Hello world!')\n    dog = yield from b + 4",
        "def simple(a, b, c) -> int:\n    global alpha\ndef another(e, f):\n    global alpha, beta, gamma",
        "for x in y:\n    break\n    continue",
        "try:\n    pass\nexcept NameError:\n    pass\nexcept Something() as other:\n    pass\nexcept None as some:\n    pass\nexcept:\n    pass\nelse:\n    pass\nfinally:\n    pass",
        "try:\n    a = 0\nexcept:\n    return",
        "@whatever\nclass a(b, *d, c=0, **e):\n    a = 0\nclass Dog:\n    age = 1\n    name = 'Ada'",
        "if x:\n    pass\nif y:\n    pass\nelse:\n    pass",
        "if a:\n    if j:\n        pass\n    elif k:\n        pass\n    else:\n        pass\nelif b:\n    pass",
        "while x == 0:\n    pass\nwhile y < z:\n    a = 0\nelse:\n    b = a",
        "import x as y, b as c, d\nimport os",
        "from . import x\nfrom .os import y\nfrom ..path import z\nfrom dog.house import a\nfrom cat import b, c as d, e",
        "with open('filename') as outfile:\n    pass",
        "with open('filename') as outfile, open('file2') as infile, other_context:\n    pass",
        "#hello world!\n# Another comment\n#: int\n\na",
        "#TODO: We need to work harder on this!",
        "a = 0\nprint(a)\nfor x in y:\n    print(b)\n    (max(a, b))",
        "with x():\n    pass",
        "(lambda x: x)()",
        "class X Alpha:\n    def beta():\n        '''\n        Hello World!\n        Testing.\n        '''",
        "'test'.replace(1, 2, 3)",
        "'\\n'",
        "'''\ntest'''",
      ];

      for (let i = 0; i < TESTS.length; i += 1) {
        let test = TESTS[i];
        editor.textEditor.setCode(test, true);
        editor.blockEditor.setCode(editor.textEditor.getCode(), true);
        console.assert(
          test.trim() === editor.textEditor.getCode().trim(),
          `\n預期:\n${test.trim()}\n\n實際:\n${editor.textEditor.getCode().trim()}\n`
        );
        if (test.trim() !== editor.textEditor.getCode().trim()) {
          break;
        }
        editor.blockEditor.changed();
        editor.blockEditor.setCode(editor.textEditor.getCode(), true);
        console.assert(
          test.trim() === editor.textEditor.getCode().trim(),
          `\n預期:\n${test.trim()}\n\n實際:\n${editor.textEditor.getCode().trim()}\n(第二次)`
        );
        if (test.trim() !== editor.textEditor.getCode().trim()) {
          break;
        }
      }
    };
  }, []);

  const handleSave = () => {
    console.log('Save button clicked (MongoDB storage not implemented)');
  };

  return (
    <div style={{ width: '900px', margin: '0 auto' }}>
      <button onClick={handleSave}>儲存工作區</button>
      <div
        ref={containerRef}
        id="blockmirror-editor"
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '480px',
          width: '100%',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};

export default BlockMirrorEditor;