import { DragableState } from ".";
import { Point, Size } from "./types";

/**
 *  拖拽事件
 */
export const dragEventMap = {
  dragStartEvent: "mousedown",
  dragMovingEvent: "mousemove",
  dragStopEvent: "mouseup"
};

type resizeControlHandlerCb = (
  movedDistance: Point,
  lastSize: Size,
  lastPosition: Point
) => Pick<DragableState, "position" | "width" | "height">;

/**
 * 控制变形方向
 */
export const resizeControlHandler: {
  [prop: string]: resizeControlHandlerCb;
} = {
  nw: (movedDistance, { width, height }, lastPosition) => {
    const computedWidth = width - movedDistance.x;
    const computedHeight = height - movedDistance.y;
    const computedPositionX = movedDistance.x + lastPosition.x;
    const computedPositionY = movedDistance.y + lastPosition.y;
    return {
      position: {
        x: computedPositionX,
        y: computedPositionY
      },
      width: computedWidth,
      height: computedHeight
    };
  },
  n: (movedDistance, { height }, lastPosition) => {
    const computedHeight = height - movedDistance.y;
    const computedPositionY = movedDistance.y + lastPosition.y;
    return {
      position: {
        x: lastPosition.x,
        y: computedPositionY
      },
      height: computedHeight
    } as Pick<DragableState, "position" | "width" | "height">;
  },
  ne: (movedDistance, { width, height }, lastPosition) => {
    const computedWidth = width + movedDistance.x;
    const computedHeight = height - movedDistance.y;
    const computedPositionY = movedDistance.y + lastPosition.y;
    return {
      position: {
        x: lastPosition.x,
        y: computedPositionY
      },
      width: computedWidth,
      height: computedHeight
    };
  },
  w: (movedDistance, { width }, lastPosition) => {
    const computedWidth = width - movedDistance.x;
    const computedPositionX = movedDistance.x + lastPosition.x;
    return {
      position: {
        x: computedPositionX,
        y: lastPosition.y
      },
      width: computedWidth
    } as Pick<DragableState, "position" | "width" | "height">;
  },
  sw: (movedDistance, { width, height }, lastPosition) => {
    const computedWidth = width - movedDistance.x;
    const computedHeight = height + movedDistance.y;
    const computedPositionX = movedDistance.x + lastPosition.x;
    return {
      position: {
        x: computedPositionX,
        y: lastPosition.y
      },
      width: computedWidth,
      height: computedHeight
    } as Pick<DragableState, "position" | "width" | "height">;
  },
  s: (movedDistance, { height }) => {
    const computedHeight = height + movedDistance.y;
    return { height: computedHeight } as Pick<DragableState, "position" | "width" | "height">;
  },
  se: (movedDistance, { width, height }) => {
    const computedWidth = width + movedDistance.x;
    const computedHeight = height + movedDistance.y;
    return { width: computedWidth, height: computedHeight } as Pick<
      DragableState,
      "position" | "width" | "height"
    >;
  },
  e: (movedDistance, { width }) => {
    const computedWidth = width + movedDistance.x;
    return { width: computedWidth } as Pick<DragableState, "position" | "width" | "height">;
  }
};

/**
 * 变形方向
 */
export type ResizeDirction = keyof typeof resizeControlHandler;

/**
 *  绑定 dom 事件
 * @param el 事件绑定对象
 * @param eventKey 事件名称
 * @param listener 事件回调
 */
export const bindEvent = (el: Node, eventKey: string, handler: EventListener) => {
  if (!el) {
    return;
  }

  if ((el as any).attachEvent) {
    (el as any).attachEvent("on" + eventKey, handler);
  } else if (el.addEventListener) {
    el.addEventListener(eventKey, handler, false);
  } else {
    (el as any)[`on${eventKey}`] = handler;
  }
};

/**
 *  解绑 dom 事件
 * @param el 事件绑定对象
 * @param eventKey 事件名称
 * @param listener 事件回调
 */
export const unBindEvent = (el: Node, eventKey: string, handler: EventListener) => {
  if (!el) {
    return;
  }

  if ((el as any).detachEvent) {
    (el as any).detachEvent("on" + eventKey, handler);
  } else if (el.removeEventListener) {
    el.removeEventListener(eventKey, handler, false);
  } else {
    (el as any)[`on${eventKey}`] = null;
  }
};
