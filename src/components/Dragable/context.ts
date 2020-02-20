import React from "react";
import { DragableProps } from ".";

export type DragableContextType = Pick<DragableProps, "position" | "width" | "height">;

export const DragableContext = React.createContext<DragableContextType>({});
