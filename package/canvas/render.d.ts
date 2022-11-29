import type * as Layers from "./layers.js";
import type { Vec2, PushOnlyArray } from "../util/index.js";
import { type TextureId, Texture } from "./texture.js";
import type { Shader as TextureShader } from "./textureShader.js";
export declare class LayersToCombine {
    readonly above: null | Layers.CollectedLayer[];
    readonly below: null | Layers.CollectedLayer[];
    readonly current: null | Layers.CollectedLayer;
    readonly anyChange: boolean;
    constructor(prevLayers: Layers.SplitLayers, nextLayers: Layers.SplitLayers);
}
export interface CombineLayersArgs {
    readonly gl: WebGLRenderingContext;
    readonly resolution: Vec2;
    readonly allTextures: PushOnlyArray<Texture>;
    readonly layersToRender: LayersToCombine;
    readonly textureShader: TextureShader;
    readonly textureBindings: (readonly [TextureId | null, number])[];
    readonly layerTextureMap: Map<Layers.Id, Texture>;
    readonly textureAbove: Texture;
    readonly textureBelow: Texture;
    readonly textureCurrent: Texture;
}
export declare function combineLayers(args: CombineLayersArgs): void;
