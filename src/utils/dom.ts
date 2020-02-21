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

/**
 * 设置body 鼠标样式
 * @param cursor
 */
export const setBodyCursor = (cursor: string) => {
  (document.body as any).style.cursor = cursor;
};
