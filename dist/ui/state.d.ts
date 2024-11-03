/// <reference types="svelte" />
import { type Readable } from "svelte/store";
import * as Canvas from "../canvas";
import { Vec2 } from "../util";
export declare const canvasResolution: Vec2;
export declare const getCanvasInfo: ({ canvasOffset, canvasResolution, }: {
    readonly canvasOffset: Vec2;
    readonly canvasResolution: Vec2;
}) => Canvas.CanvasInfo;
export declare const initialCanvasInfo: Canvas.CanvasInfo;
export declare const debuggingGl: Readable<WebGLRenderingContext>;
export declare const canvasState: Readable<Canvas.Config>;
export declare const canvasSender: Readable<Canvas.Sender>;
export declare const canvasInfo: Readable<Canvas.CanvasInfo>;
export declare const canvasEphemeral: Readable<Canvas.State>;
export interface OnPageMountArgs {
    getCanvas(): HTMLCanvasElement | undefined;
    getContainer(): HTMLElement | undefined;
}
export declare const onPageMount: ({ getCanvas, getContainer }: OnPageMountArgs) => void;
