import type { BrushPoint } from "./brushShader";
import { Vec2 } from "../util";
export declare const PX_PER_BLOCK_X = 32;
export declare const PX_PER_BLOCK_Y = 32;
export declare class Block {
    readonly x0: number;
    readonly y0: number;
    readonly x1: number;
    readonly y1: number;
    constructor(x: number, y: number);
    eq(other: Block): boolean;
    getHashcode(): number;
    contains(position: Vec2): boolean;
}
export interface RenderBlockSystemArgs {
    readonly currentTime: number;
    readonly brushPoints: readonly BrushPoint[];
}
export interface HighlightBlock {
    readonly opacity: number;
    readonly block: Block;
}
export declare class RenderBlockSystem {
    readonly debugHighlightTimeMs: number;
    private _newBrushPoints;
    private _strokeBlocks;
    private _renderBlocks;
    private _finalHighlights;
    private _lastUpdateMs;
    constructor(debugHighlightTimeMs: number);
    getFrameBlocks(): readonly Block[];
    getStrokeBlocks(): readonly Block[];
    getHighlights(): readonly HighlightBlock[];
    addBrushPoints(brushPoints: readonly BrushPoint[]): void;
    update(currentTime: number): void;
    /**
     * Mark entire canvas as needing re-rendering.
     */
    fillAll(currentTime: number, resolution: Vec2): void;
    /**
     * Call this after the stroke has ended, but before rendering the frame.
     */
    strokeEnded(): void;
}
