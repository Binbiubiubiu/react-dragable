import React from "react";
import "./App.css";
import Draggable from "react-dragable";

function App() {
  return (
    <div className="App">
      <Draggable position={{ x: 100, y: 100 }} disabled={false}>
        <div className="test-block">测试方块</div>
      </Draggable>
    </div>
  );
}

export default App;
