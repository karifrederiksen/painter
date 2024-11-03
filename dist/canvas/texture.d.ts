import type { Vec2, PushOnlyArray } from "../util/index.js";
export interface TextureId {
    __nominal: "TextureId";
}
export declare class Texture {
    readonly id: TextureId;
    readonly texture: WebGLTexture;
    readonly framebuffer: WebGLFramebuffer;
    constructor(texture: WebGLTexture, framebuffer: WebGLFramebuffer);
}
export declare function createTextureWithFramebuffer(gl: WebGLRenderingContext, allTextures: PushOnlyArray<Texture>, textureBindings: (readonly [TextureId | null, number])[], size: Vec2): Texture;
export declare function ensureTextureIsBound(gl: WebGLRenderingContext, textureBindings: (readonly [TextureId | null, number])[], { texture, id }: Texture): number;
