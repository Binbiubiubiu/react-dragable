import React, { Component } from "react";
import "./App.css";
import Dragable from "react-dragable";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
}

class App extends Component<{}, { rect: Rect }> {
  constructor(props: any) {
    super(props);
    this.state = {
      rect: { width: 200, height: 200, x: 200, y: 200, rotate: 0 }
    };
  }

  render() {
    const { rect } = this.state;
    return (
      <div className="App">
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
          {({ width, height }) => <div style={{ width, height, backgroundColor: "#f00" }}></div>}
        </Dragable>
      </div>
    );
  }
}

export default App;
