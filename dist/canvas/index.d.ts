import * as Layers from "./layers.js";
import * as Tools from "../tools/index.js";
import type * as Input from "./input.js";
import * as keymapping from "./keymapping.js";
import * as Rng from "../rng/index.js";
import * as Theme from "../ui/theme.js";
import type { BrushPoint } from "./brushShader.js";
import { Vec2, PerfTracker, type Tagged } from "../util/index.js";
export type CanvasMsg = Tagged<"OnFrame", number> | Tagged<"OnClick", Input.PointerData> | Tagged<"OnRelease", Input.PointerData> | Tagged<"OnDrag", readonly Input.PointerData[]> | Tagged<"OnKeyboard", keymapping.KeyInput> | Tagged<"RandomizeTheme"> | Tagged<"ToggleHighlightRenderBlocks"> | Tagged<"ToggleDisplayStats"> | Tagged<"ToolMsg", Tools.ToolMsg> | Tagged<"LayersMsg", Layers.Msg>;
export type Effect = Tagged<"NoOp"> | Tagged<"Batch", readonly Effect[]> | Tagged<"RenderFrame", {
    brushPoints: readonly BrushPoint[];
    config: Config;
}> | Tagged<"AddBrushPoints", readonly BrushPoint[]> | Tagged<"EndStroke", readonly BrushPoint[]>;
export declare class Sender {
    private sendMessage;
    readonly tool: Tools.Sender;
    readonly layer: Layers.Sender;
    constructor(sendMessage: (msg: CanvasMsg) => void);
    onFrame: (timeMs: number) => void;
    onClick: (input: Input.PointerData) => void;
    onRelease: (input: Input.PointerData) => void;
    onDrag: (inputs: readonly Input.PointerData[]) => void;
    onKeyboard: (input: keymapping.KeyInput) => void;
    randomizeTheme: () => void;
    toggleHighlightRenderBlocks: () => void;
    toggleDisplayStats: () => void;
}
export interface Config {
    readonly theme: Theme.Theme;
    readonly tool: Tools.Config;
    readonly layers: Layers.State;
    readonly highlightRenderBlocks: boolean;
    readonly displayStats: boolean;
    readonly keyboard: keymapping.KeyBindingSystem<CanvasMsg>;
}
export interface State {
    readonly themeRng: Rng.Seed;
    readonly tool: Tools.State;
    readonly hasPressedDown: boolean;
}
export declare function initState(): [Config, State];
export interface CanvasInfo {
    readonly offset: Vec2;
    readonly resolution: Vec2;
    readonly halfResoution: Vec2;
}
export interface TransformedPointerInput {
    readonly x: number;
    readonly y: number;
    readonly pressure: number;
    readonly originalX: number;
    readonly originalY: number;
    readonly time: number;
}
export declare function update(canvasInfo: CanvasInfo, config: Config, state: State, msg: CanvasMsg): readonly [Config, State, Effect];
export interface Hooks {
    readonly onStats: (stats: readonly PerfTracker.Sample[]) => void;
    readonly onWebglContextCreated: (gl: WebGLRenderingContext) => void;
}
export declare class Canvas {
    private readonly resolution;
    private readonly hooks;
    private readonly context;
    static create(canvas: HTMLCanvasElement, hooks: Hooks): Canvas | null;
    private readonly perfTracker;
    private constructor();
    handle(eff: Effect): void;
    dispose(): void;
}
