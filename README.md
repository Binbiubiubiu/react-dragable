# react-dragable

自己写的拖拽工具

## 示例

[![Edit currying-flower-l4cnq](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/currying-flower-l4cnq?fontsize=14&hidenavigation=1&theme=dark)

## 代码片段

```tsx
import React from "react";
import "./App.css";
import Draggable from "react-dragable";

class Scene extends Component<{}, { rect: Rect }> {
  constructor(props: any) {
    super(props);
    this.state = {
      rect: { width: 200, height: 200, x: 200, y: 200, rotate: 0 }
    };
  }

  render() {
    const { rect } = this.state;
    return (
      <div className="scene">
        <Dragable
          rect={rect}
          onChange={(rect) => {
            this.setState((state) => ({
              rect: {
                ...state,
                ...rect
              }
            }));
          }}>
          {({ width, height }) => {
            const computedStyle = { width, height, backgroundColor: "#f00" };
            return <div style={computedStyle}></div>;
          }}
        </Dragable>
      </div>
    );
  }
}

export default App;
```

## 属性

| 名称     | 类型                   | 描述 |
| -------- | ---------------------- | ---- |
| rect     | Rect                   |      |
| children | (rect:Rect)=>ReactNode |      |

### Rect

| 名称   | 类型   | 描述     |
| ------ | ------ | -------- |
| x      | number | 横坐标   |
| y      | number | 纵坐标   |
| width  | number | 宽度     |
| height | number | 高度     |
| rotate | number | 旋转角度 |

## 参考资料

[rotate-resize](https://github.com/ioslh/rotate-resize) 旋转拖拽算法
