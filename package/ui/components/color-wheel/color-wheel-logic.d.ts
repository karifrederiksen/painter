import * as Color from "color";
import { ColorMode } from "../../../util";
export interface ThumbPositions {
    angle: number;
    circleThumbX: number;
    circleThumbY: number;
    areaThumbX: number;
    areaThumbY: number;
}
export interface ColorWheelProps {
    readonly color: Color.Hsluv;
    readonly colorType: ColorMode;
    readonly onChange: (color: Color.Hsluv) => void;
}
export declare class GlState {
    readonly canvas: HTMLCanvasElement;
    private readonly gl;
    private readonly ringRenderer;
    private readonly satValRenderer;
    constructor(canvas: HTMLCanvasElement);
    render(colorMode: ColorMode, color: Color.Hsluv): void;
    getThumbPositions(colorType: ColorMode, color: Color.Hsluv): ThumbPositions;
    dispose(): void;
}
