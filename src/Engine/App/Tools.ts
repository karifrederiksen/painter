import { Renderer } from "../Rendering/Renderer";
import { Rgba, Hsv, Hsva, ColorWithAlpha } from "../Math/Color";
import { InputData, InputSource, InputType } from "../Input/InputData";
import { Vec2 } from "../Math/Vec";
import { BrushSettings } from "./BrushSettings";
import { isNumberType } from "../Common";
import { clamp, expostep } from "../Math/Utils";


export const enum ToolType {
	Brush,
	Eraser,
	Blur
}

export interface Tool {
	onData(data: InputData): void;
}