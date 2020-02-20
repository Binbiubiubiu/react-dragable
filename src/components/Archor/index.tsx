import React, { Component } from "react";
import cls from "classnames";

import "./style.less";

import {
  ResizeDirction,
  bindEvent,
  unBindEvent,
  DRAG_EVENT_MAP,
  resizeControlHandler
} from "../Dragable/utils";
import { DragableState } from "../Dragable";
import { DragableContext, DragableContextType } from "../Dragable/context";
import { Point, Size } from "../Dragable/types";

const { DRAG_MOVING, DRAG_STOP } = DRAG_EVENT_MAP;

interface ArchorProps {
  direction: ResizeDirction;
  onMoving: (options: Pick<DragableState, "position" | "width" | "height">) => void;
}

interface ArchorState {
  resizeNodePosition: Point; // 变形开始时，组件的位置
  resizeStartPosition: Point; // 变形开始时 鼠标的位置
  resizeStartSize: Size; //变形开始时组件的大小
}

class Archor extends Component<ArchorProps, ArchorState, DragableContextType> {
  static contextType = DragableContext;

  constructor(props: ArchorProps, context: DragableContextType) {
    super(props);
    const { position, width, height } = context;

    this.state = {
      resizeNodePosition: position as Point,
      resizeStartPosition: { x: 0, y: 0 },
      resizeStartSize: { width: width || 0, height: height || 0 }
    };
  }

  handleResizeStart = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    const event = e.nativeEvent;

    const { position, width, height } = this.context;
    console.log(position, width, height);

    this.setState(() => ({
      resizeNodePosition: position,
      resizeStartPosition: { x: event.clientX, y: event.clientY },
      resizeStartSize: { width, height }
    }));

    bindEvent(document, DRAG_MOVING, this.handleResizeMove);
    bindEvent(document, DRAG_STOP, this.handleResizeStop);
  };

  handleResizeMove: EventListener = (e) => {
    const event = e as MouseEvent;
    const { onMoving, direction } = this.props;
    const { resizeStartPosition, resizeStartSize, resizeNodePosition } = this.state;

    const computedResult = resizeControlHandler[direction](
      { x: event.clientX - resizeStartPosition.x, y: event.clientY - resizeStartPosition.y },
      resizeStartSize,
      resizeNodePosition
    );

    onMoving(computedResult);
  };

  handleResizeStop = () => {
    unBindEvent(document, DRAG_MOVING, this.handleResizeMove);
    unBindEvent(document, DRAG_STOP, this.handleResizeStop);
  };
  render() {
    const { direction } = this.props;
    return (
      <i
        className={cls("archor", `archor-${direction}`)}
        onMouseDown={this.handleResizeStart}
        style={{ cursor: `${direction}-resize` }}></i>
    );
  }
}

export default Archor;
