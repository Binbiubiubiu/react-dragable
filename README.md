# react-dragable

自己写的拖拽工具

## 示例

[![Edit currying-flower-l4cnq](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/currying-flower-l4cnq?fontsize=14&hidenavigation=1&theme=dark)

## 代码片段

```tsx
import React from "react";
import "./App.css";
import Draggable from "react-dragable";

function App() {
  return (
    <div className="App">
      <Draggable position={{ x: 100, y: 100 }} disabled={false}>
        <div className="test-block">test block</div>
      </Draggable>
    </div>
  );
}

export default App;
```

## 属性

| 名称     | 类型                | 描述       |
| -------- | ------------------- | ---------- |
| position | {x:number,y:number} | 初始化位置 |
| width    | number              | 宽度       |
| height   | number              | 高度       |
| disabled | boolean             | 禁用拖拽   |
