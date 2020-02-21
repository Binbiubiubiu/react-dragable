/**
 * 坐标
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 图形信息
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
}

/**
 * 8个 archor : "nw", "n", "ne", "e", "se", "s", "sw", "w"
 */
export const ARCHOR = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

/**
 * 操作类型
 *  - ROTATE = "rotate",
 *  - RESIZE = "resize",
 *  - MOVE = "move",
 *  - NONE = ""
 */
export enum Actions {
  ROTATE = "rotate",
  RESIZE = "resize",
  MOVE = "move",
  NONE = ""
}

/**
 * archor 类型
 */
export type ArchorType = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/**
 * 初始化常量
 */
export const EMPTY_POINT: Point = { x: 0, y: 0 };
export const EMPTY_RECT: Rect = { x: 0, y: 0, width: 0, height: 0, rotate: 0 };

const PRECISION = 1e-5;

export const symmetryPoint = (start: Point, center: Point) => {
  const [x, y] = (["x", "y"] as Array<keyof Point>).map(
    (k) => start[k] + 2 * (center[k] - start[k])
  );
  return { x, y };
};

/**
 * 近似相等
 * @param x
 * @param y
 * @param precision
 */
const roughlyEqual = (x: number, y: number, precision = PRECISION) => Math.abs(x - y) < precision;

/**
 * 获取鼠标位置 （使用pageX 受外界影响小）
 * @param e
 */
export const getMousePoint = (e: MouseEvent) => ({
  x: e.pageX,
  y: e.pageY
});

/**
 * 计算一个矩形的中心点坐标
 * @param {*} rect
 */
export const rectCenter = (rect: Rect) => {
  const { x, y, width, height } = rect;
  return {
    x: x + width / 2,
    y: y + height / 2
  };
};

/**
 * 计算向量 point 的角度
 * @param {Point} point
 */
export const angleDegrees = (point: Point) => {
  const { x, y } = point;
  return (Math.atan2(y, x) * 180) / Math.PI;
};

/**
 * 页面坐标点 position 以 relative 点为原点
 * 顺时针旋转 angle 角度后得到的坐标点
 * @param {Point} position
 * @param {Point} relative
 * @param {Number} angle
 */
export const rotatePositionRelatively = (position: Point, relative: Point, angle: number) => {
  const shiftPosition = {
    x: position.x - relative.x,
    y: position.y - relative.y
  };
  const resultPosition = rotatePosition(shiftPosition, angle);
  return {
    x: resultPosition.x + relative.x,
    y: resultPosition.y + relative.y
  };
};

/**
 * 页面坐标点 position 以页面左上角为原点，顺时针旋转 angle 角度后得到的坐标点
 * @param {Point} position
 * @param {Number} angle
 */
export const rotatePosition = (position: Point, angle: number) => {
  const radical = (angle / 180) * Math.PI;
  const sinA = Math.sin(radical);
  const cosA = Math.cos(radical);
  const { x, y } = position;
  return {
    x: x * cosA - y * sinA,
    y: x * sinA + y * cosA
  };
};

/**
 * @param {Point} pa
 * @param {Point} pb
 * 获取坐标 pa 和 pb 的中间点坐标
 */
export const centerPoint = (pa: Point, pb: Point) => ({
  x: (pa.x + pb.x) / 2,
  y: (pa.y + pb.y) / 2
});

/*
 * 原始矩形，倾斜角度为 0 deg
 * A----------------------B
 * |                      |
 * |                      |
 * |                      |
 * |                      |
 * |                      |
 * C----------------------D
 *
 */

/**
 * 传入两点坐标，以及(线段 AC 的)倾斜角度
 * 返回唯一确定的矩形的位置
 * @param {Point} pa
 * @param {Point} pb
 * @param {Number} angel
 */
export const computeRectWithCrossPoints = (pa: Point, pb: Point, angle: number) => {
  const center = centerPoint(pa, pb);
  const rotatedPosition = rotatePositionRelatively(pb, center, -angle);
  const { x, y } = rotatedPosition;
  const width = Math.abs((x - center.x) * 2);
  const height = Math.abs((y - center.y) * 2);
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
    rotate: angle
  };
};

/**
 * 计算一条直线上（由 points 两点确定）离 point 点最近的点，即垂直交叉点
 * @param {Point[]} points
 * @param {Point} point
 */
export const squareCrossPoint = (points: Point[], point: Point) => {
  const { x, y } = point;
  const [p0, p1] = points;
  if (roughlyEqual(p0.x, p1.x)) {
    return { x: p0.x, y };
  } else if (roughlyEqual(p0.y, p1.y)) {
    return { x, y: p0.y };
  }
  const baseSlope = lineSlope(p0, p1);
  const verticalSlope = -1 / baseSlope;
  const nextX = (baseSlope * p0.x + y - p0.y - verticalSlope * x) / (baseSlope - verticalSlope);
  const nextY = p0.y - baseSlope * (p0.x - nextX);
  return { x: nextX, y: nextY };
};

/**
 * 根据两点坐标，计算距离
 * @param {Point} p0
 * @param {Point} p1
 */
export const pointsDistance = (p0: Point, p1: Point) => {
  const x = p0.x - p1.x;
  const y = p0.y - p1.y;
  return Math.sqrt(x * x + y * y);
};

export const EndPoints = class EndPoints {
  rect: Rect;
  _lt: Point | null;
  _rt: Point | null;
  _rb: Point | null;
  _lb: Point | null;
  _ct: Point | null;
  _cb: Point | null;
  _rm: Point | null;
  _lm: Point | null;
  _center: Point | null;

  constructor(rect: Rect) {
    this.rect = rect;
    this._lt = null;
    this._rt = null;
    this._rb = null;
    this._lb = null;
    this._ct = null;
    this._cb = null;
    this._rm = null;
    this._lm = null;
    this._center = null;
  }

  get center() {
    if (!this._center) {
      this._center = rectCenter(this.rect);
    }
    return this._center;
  }

  get lt() {
    if (!this._lt) {
      const { x, y, rotate } = this.rect;
      this._lt = rotatePositionRelatively({ x, y }, this.center, rotate);
    }
    return this._lt;
  }

  get rt() {
    if (!this._rt) {
      const { x, y, width, rotate } = this.rect;
      this._rt = rotatePositionRelatively({ x: x + width, y }, this.center, rotate);
    }
    return this._rt;
  }

  get rb() {
    if (!this._rb) {
      this._rb = symmetryPoint(this.lt, this.center);
    }
    return this._rb;
  }

  get lb() {
    if (!this._lb) {
      this._lb = symmetryPoint(this.rt, this.center);
    }
    return this._lb;
  }

  get ct() {
    if (!this._ct) {
      this._ct = centerPoint(this.lt, this.rt);
    }
    return this._ct;
  }

  get cb() {
    if (!this._cb) {
      this._cb = centerPoint(this.rb, this.lb);
    }
    return this._cb;
  }

  get rm() {
    if (!this._rm) {
      this._rm = centerPoint(this.rt, this.rb);
    }
    return this._rm;
  }

  get lm() {
    if (!this._lm) {
      this._lm = centerPoint(this.lt, this.lb);
    }
    return this._lm;
  }
};

/* -------------------------------------------------------------------------- */
/*                                    move                                    */
/* -------------------------------------------------------------------------- */

/**
 * 移动矩形，返回移动的矩形数据
 * @param {Point} mouseStart
 * @param {Point} mouseEnd
 * @param {Rect} rectStart
 */
export const moveRect = (mouseStart: Point, mouseEnd: Point, rectStart: Rect) => {
  const x = mouseEnd.x - mouseStart.x;
  const y = mouseEnd.y - mouseStart.y;
  return {
    ...rectStart,
    x: rectStart.x + x,
    y: rectStart.y + y
  };
};

/* -------------------------------------------------------------------------- */
/*                                   rotate                                   */
/* -------------------------------------------------------------------------- */

/**
 * 根据两点坐标，计算其连线的斜率。注意，垂直时斜率是 Infinity
 * @param {Point} p0
 * @param {Point} p1
 */
export const lineSlope = (p0: Point, p1: Point) => (p1.y - p0.y) / (p1.x - p0.x);

/**
 * 传入两个点 p0， p1，返回两点连线的倾斜角度
 * 垂直状态是 0，遵循 DOM 的 rotation 规则，值域范围 [-90, 90]
 * @param {Point} p0
 * @param {Point} p1
 */
export const lineDegrees = (p0: Point, p1: Point) => {
  if (roughlyEqual(p0.x, p1.x)) {
    return 0;
  }
  const slope = lineSlope(p0, p1);
  const degrees = (Math.atan(slope) / Math.PI) * 180;
  return 90 + degrees;
};

/**
 * 计算鼠标从 start 点拖到到 end 点时的旋转角度
 * @param {Point[]} pinnedPoints
 * @param {Point} start
 * @param {Point} end
 */
export const computeRotation = (center: Point, start: Point, end: Point) => {
  const shiftStart = {
    x: start.x - center.x,
    y: start.y - center.y
  };
  const shiftEnd = {
    x: end.x - center.x,
    y: end.y - center.y
  };
  const startDegrees = angleDegrees(shiftStart);
  const endDegrees = angleDegrees(shiftEnd);
  return endDegrees - startDegrees;
};

/**
 * 计算鼠标从 mouseStart 点开始按住旋转到 mouseEnd 后返回的矩形，值域为 [-180, 180]
 * @param {Point} mouseStart
 * @param {Point} mouseEnd
 * @param {Rect} rectStart
 */
export const rotateRect = (mouseStart: Point, mouseEnd: Point, rectStart: Rect) => {
  const center = rectCenter(rectStart);
  // const shrotcutRotations = [-180, -135, -90, -45, 0, 45, 90, 135, 180]
  const offsetRotation = computeRotation(center, mouseStart, mouseEnd);
  let nextRotation = rectStart.rotate + offsetRotation;
  if (nextRotation >= 180) {
    nextRotation = nextRotation - 360;
  }
  if (nextRotation <= -180) {
    nextRotation = nextRotation + 360;
  }
  return {
    ...rectStart,
    rotate: nextRotation
  };
};

/* -------------------------------------------------------------------------- */
/*                                   resize                                   */
/* -------------------------------------------------------------------------- */

/**
 * 根据一条边（pinnedPoints 两点确定），和对应的拖拽点（dragPoint），生成一个宽高比固定的矩形
 * @param {Point[]} pinnedPoints 拖拽固定边
 * @param {Point} dragPoint 拖拽点
 * @param {Number} rectRatio 原始矩形的宽高比
 * @param {"width" | "height"} activeExpand 拖拽的属性（width / height）
 */
export const computeRatioedRectWithPinnedLine = (
  pinnedPoints: Point[],
  dragPoint: Point,
  rectStart: Rect,
  activeExpand: "width" | "height" | null
) => {
  const [p0, p1] = pinnedPoints;
  const middle1 = centerPoint(p0, p1);
  const middle2 = dragPoint;
  const center = centerPoint(middle1, middle2);
  const distance = pointsDistance(middle1, middle2);
  const rectRatio = rectStart.width / rectStart.height;
  let width, height;
  if (activeExpand === "width") {
    width = distance;
    height = width / rectRatio;
  } else {
    height = distance;
    width = rectRatio * height;
  }
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
    rotate: rectStart.rotate
  };
};

/**
 * 根据一条线段（由 pinnedPoints 两点确定），拖拽点坐标（dragPoint），以及倾斜角度（angle）返回一个确定的矩形
 * @param {Point[]} pinnedPoints
 * @param {Point} dragPoint
 * @param {Number} angle
 */
export const computeRectWithPinnedLine = (
  pinnedPoints: Point[],
  dragPoint: Point,
  angle: number
) => {
  const [rotateP0, rotateP1] = pinnedPoints.map((p) => rotatePosition(p, -angle));
  const rotateDrag = rotatePosition(dragPoint, -angle);
  let w, h, rotatedCenter;
  if (roughlyEqual(rotateP0.y, rotateP1.y)) {
    w = Math.abs(rotateP0.x - rotateP1.x);
    h = Math.abs(rotateDrag.y - rotateP0.y);
    rotatedCenter = {
      x: (rotateP0.x + rotateP1.x) / 2,
      y: (rotateP0.y + rotateDrag.y) / 2
    };
  } else if (roughlyEqual(rotateP0.x, rotateP1.x)) {
    h = Math.abs(rotateP0.y - rotateP1.y);
    w = Math.abs(rotateDrag.x - rotateP0.x);
    rotatedCenter = {
      x: (rotateP0.x + rotateDrag.x) / 2,
      y: (rotateP0.y + rotateP1.y) / 2
    };
  }
  const center = rotatePosition(rotatedCenter as Point, angle);
  const x = center.x - (w || 0) / 2;
  const y = center.y - (h || 0) / 2;
  return {
    x,
    y,
    width: w,
    height: h,
    rotate: angle
  };
};

/**
 * resize 矩形，返回 resize 后的矩形数据
 * @param {Point} mouseStart
 * @param {Point} mouseEnd
 * @param {AdjustType} adjustType
 * @param {Rect} rectStart
 * @param {number} fixedRatio
 */
export const resizeRect = (
  mouseStart: Point,
  mouseEnd: Point,
  adjustType: ArchorType,
  rectStart: Rect,
  fixedRatio: boolean
) => {
  const e = new EndPoints(rectStart);
  let activeExpand: "width" | "height" | null = null;
  let acrossPoints: Point[] = [];
  let fixedMouseEnd = mouseEnd;
  if (fixedRatio) {
    switch (adjustType) {
      case "nw":
      case "se":
        acrossPoints = [e.lt, e.rb];
        break;
      case "ne":
      case "sw":
        acrossPoints = [e.rt, e.lb];
        break;
      case "n":
      case "s":
        acrossPoints = [e.ct, e.cb];
        activeExpand = "height";
        break;
      case "w":
      case "e":
        acrossPoints = [e.lm, e.rm];
        activeExpand = "width";
        break;
      default:
        acrossPoints = [];
    }
    if (acrossPoints.length === 2) {
      fixedMouseEnd = squareCrossPoint(acrossPoints, mouseEnd);
    }
  }

  let pinnedPoints: Point[] = [];
  switch (adjustType) {
    case "nw":
      pinnedPoints = [e.rb];
      break;
    case "ne":
      pinnedPoints = [e.lb];
      break;
    case "sw":
      pinnedPoints = [e.rt];
      break;
    case "se":
      pinnedPoints = [e.lt];
      break;
    case "s":
      pinnedPoints = [e.lt, e.rt];
      break;
    case "n":
      pinnedPoints = [e.lb, e.rb];
      break;
    case "w":
      pinnedPoints = [e.rt, e.rb];
      break;
    case "e":
      pinnedPoints = [e.lt, e.lb];
      break;
    default:
      pinnedPoints = [];
  }

  const { length } = pinnedPoints;
  let result;
  if (length === 1) {
    result = computeRectWithCrossPoints(pinnedPoints[0], fixedMouseEnd, rectStart.rotate);
  } else if (length === 2) {
    if (fixedRatio) {
      result = computeRatioedRectWithPinnedLine(
        pinnedPoints,
        fixedMouseEnd,
        rectStart,
        activeExpand
      );
    } else {
      result = computeRectWithPinnedLine(pinnedPoints, fixedMouseEnd, rectStart.rotate);
    }
  }
  return result;
};

/**
 * 计算入口
 * @param {Position} mouseStart
 * @param {Position} mouseEnd
 * @param {AdjustType} adjustType: 'rotate'|'move'|'lt'|'rt'|'ct'|'lb'|'rb'|'cb'|'lm'|'rm'|null
 * @param {Rect} rectStart: { x: Number, y: Number, width: Number, height: Number, rotate: Number }
 * @param {Boolean} fixedRatio
 */
export default (
  adjustType: ArchorType | Actions,
  mouseStart: Point,
  mouseEnd: Point,
  rectStart: Rect,
  fixedRatio: boolean = false
) => {
  if (adjustType === "move") {
    return moveRect(mouseStart, mouseEnd, rectStart);
  }
  if (adjustType === "rotate") {
    return rotateRect(mouseStart, mouseEnd, rectStart);
  }
  return resizeRect(mouseStart, mouseEnd, adjustType as ArchorType, rectStart, fixedRatio);
};
