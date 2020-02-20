import React, { Component } from "react";
import ReactDOM from "react-dom";
import cls from "classnames";

import "./style.less";
import { dragEventMap, resizeControlHandler, bindEvent, unBindEvent } from "./utils";
import { Point, Size } from "./types";

const defaultProps = {
  position: { x: 0, y: 0 },
  width: 200,
  height: 200,
  disabled: false
};

export type DragableProps = {} & Partial<typeof defaultProps>;

export interface DragableState {
  position: Point;
  width: number;
  height: number;

  isActive: boolean; // 组件激活选中状态

  moveStartPositon: Point; // 移动开始时,鼠标的位置

  resizeNodePosition: Point; // 变形开始时，组件的位置
  resizeStartPosition: Point; // 变形开始时 鼠标的位置
  resizeDirection: string; // 变形的方向
  resizeStartSize: Size; //变形开始时组件的大小
}

export default class Dragable extends Component<DragableProps, DragableState> {
  static defaultProps = defaultProps;
  thisNode: Element | Text | null = null;

  constructor(props: DragableProps) {
    super(props);
    const { position, width, height } = props;
    this.state = {
      // focuse
      isActive: false,
      // move
      position: position as Point,
      moveStartPositon: {
        x: 0,
        y: 0
      },
      //resize
      width: width as number,
      height: height as number,
      resizeNodePosition: position as Point,
      resizeStartPosition: { x: 0, y: 0 },
      resizeDirection: "",
      resizeStartSize: { width: width || 0, height: height || 0 }
    };
  }

  shouldComponentUpdate(nextProps: DragableProps, nextState: DragableState) {
    !this.state.isActive && nextState.isActive && this.handleNodeBlur();
    return true;
  }

  componentDidMount() {
    this.thisNode = ReactDOM.findDOMNode(this);
  }

  componentWillUnmount() {
    unBindEvent(document, dragEventMap.dragMovingEvent, this.handleDragMove);
    unBindEvent(document, dragEventMap.dragStopEvent, this.handleDragStop);
  }

  /**
   * 组件失去焦点
   *
   * @memberof Dragable
   */
  handleNodeBlur = () => {
    const { thisNode } = this;

    const eventName = "click";
    // 点击对象不再组件内时候，组件失去焦点
    const handler: EventListener = (e) => {
      const eventTarget = e.target as Node;
      if (thisNode !== eventTarget && !thisNode?.contains(eventTarget)) {
        this.setState(
          {
            isActive: false
          },
          () => {
            unBindEvent(document, eventName, handler);
          }
        );
      }
    };

    bindEvent(document, eventName, handler);
  };

  /**
   * 组件拖拽（进行中处理）
   *
   * @type {EventListener}
   * @memberof Dragable
   */
  handleDragMove: EventListener = (e) => {
    const event = e as MouseEvent;

    this.setState(({ moveStartPositon }) => ({
      position: {
        x: event.clientX - moveStartPositon.x,
        y: event.clientY - moveStartPositon.y
      }
    }));
  };

  /**
   * 组件拖拽 (开始)
   *
   * @memberof Dragable
   */
  handleDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const event = e.nativeEvent;

    this.setState(({ position }) => ({
      moveStartPositon: { x: event.clientX - position.x, y: event.clientY - position.y }
    }));

    bindEvent(document, dragEventMap.dragMovingEvent, this.handleDragMove);
    bindEvent(document, dragEventMap.dragStopEvent, this.handleDragStop);
  };

  /**
   * 组件拖拽 (开始结束)
   *
   * @memberof Dragable
   */
  handleDragStop = () => {
    unBindEvent(document, dragEventMap.dragMovingEvent, this.handleDragMove);
    unBindEvent(document, dragEventMap.dragStopEvent, this.handleDragStop);
  };

  onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (this.props.disabled) {
      return;
    }

    this.setState({ isActive: true });
    this.handleDragStart(e);
  };

  render() {
    const { children } = this.props;
    const { position, isActive, width, height } = this.state;
    return (
      <div
        onMouseDown={this.onMouseDown}
        className={cls("dragable", { "dragable-active": isActive })}
        style={{ left: position.x, top: position.y, width, height }}>
        {this.renderResizeControl(isActive)}
        {React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement, {
            style: {
              ...(React.isValidElement(child) ? child.props.style : {}),
              width,
              height
            }
          })
        )}
      </div>
    );
  }

  /**
   * 渲染 resize 组件
   * @param isActive
   */
  renderResizeControl(isActive: boolean) {
    return (
      isActive &&
      Object.keys(resizeControlHandler).map((control: string) => (
        <i
          key={control}
          className={cls("dragable-resize", `dragable-resize-${control}`)}
          onMouseDown={(e) => {
            e.stopPropagation();
            this.handleResizeStart(e, control);
          }}
          style={{ cursor: `${control}-resize` }}></i>
      ))
    );
  }

  handleResizeStart = (e: React.MouseEvent<HTMLElement, MouseEvent>, direction: string) => {
    const event = e.nativeEvent;

    this.setState(({ width, height, position }) => ({
      resizeNodePosition: position,
      resizeStartPosition: { x: event.clientX, y: event.clientY },
      resizeDirection: direction,
      resizeStartSize: { width, height }
    }));

    bindEvent(document, dragEventMap.dragMovingEvent, this.handleResizeMove);
    bindEvent(document, dragEventMap.dragStopEvent, this.handleResizeStop);
  };

  handleResizeMove: EventListener = (e) => {
    const event = e as MouseEvent;

    this.setState(({ resizeStartPosition, resizeDirection, resizeStartSize, resizeNodePosition }) =>
      resizeControlHandler[resizeDirection](
        { x: event.clientX - resizeStartPosition.x, y: event.clientY - resizeStartPosition.y },
        resizeStartSize,
        resizeNodePosition
      )
    );
  };

  handleResizeStop = () => {
    unBindEvent(document, dragEventMap.dragMovingEvent, this.handleResizeMove);
    unBindEvent(document, dragEventMap.dragStopEvent, this.handleResizeStop);
  };
}
