import React, { Component } from "react";
import ReactDOM from "react-dom";
import cls from "classnames";

import "./style.less";
import { DRAG_EVENT_MAP, resizeControlHandler, bindEvent, unBindEvent } from "./utils";
import Archor from "../Archor";
import { DragableContext } from "./context";
import { Point } from "./types";

const { DRAG_MOVING, DRAG_STOP } = DRAG_EVENT_MAP;

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
      height: height as number
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
    unBindEvent(document, DRAG_MOVING, this.handleDragMove);
    unBindEvent(document, DRAG_STOP, this.handleDragStop);
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

    bindEvent(document, DRAG_MOVING, this.handleDragMove);
    bindEvent(document, DRAG_STOP, this.handleDragStop);
  };

  /**
   * 组件拖拽 (开始结束)
   *
   * @memberof Dragable
   */
  handleDragStop = () => {
    unBindEvent(document, DRAG_MOVING, this.handleDragMove);
    unBindEvent(document, DRAG_STOP, this.handleDragStop);
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
      <DragableContext.Provider value={{ position, width, height }}>
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
      </DragableContext.Provider>
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
        <Archor key={control} direction={control} onMoving={this.handleArchorMoving} />
      ))
    );
  }

  handleArchorMoving = (options: Pick<DragableState, "position" | "width" | "height">) => {
    this.setState(() => options);
  };
}
