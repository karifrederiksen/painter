import * as OutputShader from "./outputShader";
import * as BrushTextureShader from "./brushTextureGenerator";
import * as TextureShader from "./textureShader";
import * as ClearBlocksShader from "./clearBlocksShader";
import * as BlockHighlightShader from "./blockHighlightShader";
import * as BrushShader from "./brushShader";
import type * as Layers from "./layers";
import { Blend } from "../webgl";
import { type Result, Vec2 } from "../util";
export declare function create(canvas: HTMLCanvasElement): Result<readonly [Context, WebGLRenderingContext], string>;
interface CreationArgs {
    readonly gl: WebGLRenderingContext;
    readonly brushTextureGenerator: BrushTextureShader.Generator;
    readonly textureRenderer: TextureShader.Shader;
    readonly clearBlocksRenderer: ClearBlocksShader.Shader;
    readonly blockHighlightShader: BlockHighlightShader.Shader;
    readonly outputRenderer: OutputShader.Shader;
    readonly drawpointBatch: BrushShader.Shader;
    readonly resolution: Vec2;
}
export interface RenderArgs {
    readonly currentTime: number;
    readonly resolution: Vec2;
    readonly blendMode: Blend.Mode;
    readonly brush: {
        readonly softness: number;
    };
    readonly nextLayers: Layers.SplitLayers;
    readonly highlightRenderBlocks: boolean;
}
export declare class Context {
    private readonly gl;
    private readonly brushTextureGenerator;
    private readonly textureRenderer;
    private readonly clearBlocksRenderer;
    private readonly blockHighlightShader;
    private readonly outputRenderer;
    private readonly drawpointBatch;
    private readonly allTextures;
    private readonly textureBindings;
    private readonly layerTextureMap;
    private internalCanvasSize;
    private stroke;
    private renderBlockSystem;
    private prevLayers;
    private readonly brushTexture;
    private readonly outputTexture;
    private readonly combinedLayers;
    constructor(args: CreationArgs);
    addBrushPoints(brushPoints: readonly BrushShader.BrushPoint[]): void;
    endStroke(): void;
    render(args: RenderArgs): void;
    dispose(): void;
}
export {};
