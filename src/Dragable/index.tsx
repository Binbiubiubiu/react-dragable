import React, { Component, FC } from "react";
import cls from "classnames";

import "./style.less";
import { DRAG_EVENT_MAP } from "../utils/constants";
import {
  EMPTY_POINT,
  Point,
  Rect,
  EMPTY_RECT,
  getMousePoint,
  default as rotateResizeRect,
  Actions,
  ARCHOR,
  ArchorType
} from "../utils/rotateResize";
import { unBindEvent, bindEvent, setBodyCursor } from "../utils";

const { DRAG_MOVING, DRAG_STOP } = DRAG_EVENT_MAP;

interface RotateArrowProps {
  onMouseDown: (e: any) => void;
}

const RotateArrow: FC<RotateArrowProps> = (props) => {
  const { onMouseDown } = props;
  return (
    <svg
      className="archor-rotate"
      onMouseDown={onMouseDown}
      viewBox="0 0 1024 1024"
      width="20"
      height="20">
      <path d="M935.497143 659.017143a36.937143 36.937143 0 0 1-1.755429 18.505143 434.322286 434.322286 0 0 1-370.980571 337.773714C325.632 1045.650286 107.373714 876.251429 77.531429 637.293714a435.712 435.712 0 0 1 378.587428-487.131428c5.778286-1.243429 13.385143-1.901714 19.748572-1.974857-2.633143-24.137143-5.851429-46.518857-7.899429-66.267429-3.291429-25.526857-6.582857-44.617143-6.582857-50.980571-1.974857-7.021714-1.389714-15.36 3.657143-21.065143a21.796571 21.796571 0 0 1 31.305143-4.608l0.585142 1.243428 17.993143 16.530286 126.683429 98.962286 17.92 13.312 15.36 11.410285c5.12 3.803429 7.68 8.850286 8.996571 14.628572a20.260571 20.260571 0 0 1-4.388571 16.603428l-11.410286 15.36-13.312 17.92L555.885714 337.92l-14.555428 18.578286-1.243429 0.658285a23.625143 23.625143 0 0 1-31.890286 3.291429c-5.778286-5.12-9.654857-12.726857-8.411428-19.748571-1.316571-5.705143-3.291429-25.453714-6.582857-50.980572-2.633143-17.846857-5.266286-38.838857-7.899429-59.904-6.436571 0-13.385143 1.974857-19.748571 1.974857-193.828571 24.502857-332.726857 201.801143-308.297143 395.556572 24.502857 193.828571 201.801143 332.726857 395.556571 308.224a353.426286 353.426286 0 0 0 303.616-281.307429 40.082286 40.082286 0 0 1 34.377143-30.134857c22.235429-3.291429 43.373714 13.165714 44.763429 34.889143z"></path>
    </svg>
  );
};

const defaultProps = {};

export type DragableProps = {
  rect: Rect;
  onChange: (rect: Rect) => void;
} & Partial<typeof defaultProps>;

export interface DragableState {}

class Dragable extends Component<DragableProps, DragableState> {
  static defaultProps = defaultProps;
  thisNode: Element | Text | null = null;
  // 便于计算的缓存变量
  action: Actions = Actions.NONE;
  mouseStart: Point = EMPTY_POINT; // 变换开始前的鼠标位置
  rectStart: Rect = EMPTY_RECT; // 变换开始前的rect
  fixedRatio: boolean = false;
  archor: ArchorType = "s";

  componentWillUnmount() {
    unBindEvent(document, DRAG_MOVING, this.handleDragMove);
    unBindEvent(document, DRAG_STOP, this.handleDragStop);
  }

  /**
   * 组件拖拽（进行中处理）
   *
   * @type {EventListener}
   * @memberof Dragable
   */
  handleDragMove: EventListener = (e) => {
    const { onChange } = this.props;
    const { mouseStart, rectStart, action, archor, fixedRatio } = this;
    const mouseEnd = getMousePoint(e as MouseEvent);

    onChange(
      rotateResizeRect(
        action === Actions.RESIZE ? archor : action,
        mouseStart,
        mouseEnd,
        rectStart,
        fixedRatio
      ) as Rect
    );
  };

  /**
   * 组件拖拽 (开始)
   *
   * @memberof Dragable
   */
  handleDragStart = (e: React.MouseEvent<HTMLElement, MouseEvent>, action: Actions) => {
    e.stopPropagation();

    const event = e.nativeEvent;
    const { rect } = this.props;

    this.mouseStart = getMousePoint(event);
    this.rectStart = rect;
    this.action = action;
    this.fixedRatio = e.shiftKey;

    // 绑定 鼠标滑动与释放事件
    bindEvent(document, DRAG_MOVING, this.handleDragMove);
    bindEvent(document, DRAG_STOP, this.handleDragStop);

    // 设置 背景鼠标友好提示
    switch (action) {
      case Actions.MOVE:
        setBodyCursor("move");
        break;
      case Actions.ROTATE:
        setBodyCursor("pointer");
        break;
      case Actions.RESIZE:
        const cursor = (event.target as any).style.cursor;
        setBodyCursor(cursor);
        this.archor = cursor.replace(/-resize/, "");
        break;
      default:
        break;
    }
  };

  /**
   * 组件拖拽 (开始结束)
   *
   * @memberof Dragable
   */
  handleDragStop = () => {
    //解绑拖拽事件
    unBindEvent(document, DRAG_MOVING, this.handleDragMove);
    unBindEvent(document, DRAG_STOP, this.handleDragStop);

    //重设
    setBodyCursor("auto");
  };

  render() {
    const { rect, children } = this.props;

    return (
      <div
        onMouseDown={(e) => this.handleDragStart(e, Actions.MOVE)}
        className={cls("dragable", { "dragable-active": true })}
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          transform: `rotate(${rect.rotate}deg)`
        }}>
        {children}
        {ARCHOR.map((direct) => {
          return (
            <i
              key={direct}
              className={cls("archor", `archor-${direct}`)}
              style={{ cursor: `${direct}-resize` }}
              onMouseDown={(e) => this.handleDragStart(e, Actions.RESIZE)}></i>
          );
        })}
        <RotateArrow onMouseDown={(e) => this.handleDragStart(e, Actions.ROTATE)} />
      </div>
    );
  }
}

export default Dragable;
