import React from 'react';
import BlockMirrorEditor from './components/BlockMirrorEditor';

function App() {
  return (
    <div>
      <h1>BlockMirror in React</h1>
      <p>請使用選擇敘述撰寫一程式，讓使用者輸入一個正整數，然後判斷它是否為偶數（even）。</p>
      <BlockMirrorEditor />
    </div>
  );
}

export default App;