import type { Vec2, PushOnlyArray } from "../util/index.js";

export interface TextureId {
    __nominal: "TextureId";
}

let nextTextureId = 1;

export class Texture {
    readonly id: TextureId;
    readonly texture: WebGLTexture;
    readonly framebuffer: WebGLFramebuffer;

    constructor(texture: WebGLTexture, framebuffer: WebGLFramebuffer) {
        this.id = nextTextureId++ as any;
        this.texture = texture;
        this.framebuffer = framebuffer;
    }
}

export function createTextureWithFramebuffer(
    gl: WebGLRenderingContext,
    allTextures: PushOnlyArray<Texture>,
    textureBindings: (readonly [TextureId | null, number])[],
    size: Vec2,
): Texture {
    const texture = new Texture(
        gl.createTexture() as WebGLTexture,
        gl.createFramebuffer() as WebGLFramebuffer,
    );

    allTextures.push(texture);
    ensureTextureIsBound(gl, textureBindings, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, texture.framebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture.texture,
        0,
    );

    const frameBufferStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    switch (frameBufferStatus) {
        case gl.FRAMEBUFFER_COMPLETE:
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            console.warn("FRAMEBUFFER_INCOMPLETE_ATTACHMENT for texture:", texture);
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            console.warn("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT for texture:", texture);
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            console.warn("FRAMEBUFFER_INCOMPLETE_DIMENSIONS for texture:", texture);
            break;
        case gl.FRAMEBUFFER_UNSUPPORTED:
            console.warn("FRAMEBUFFER_UNSUPPORTED for texture:", texture);
            break;
        default:
            throw new Error("Unexpected status: " + frameBufferStatus);
    }
    return texture;
}

export function ensureTextureIsBound(
    gl: WebGLRenderingContext,
    textureBindings: (readonly [TextureId | null, number])[],
    { texture, id }: Texture,
): number {
    for (let i = 0; i < textureBindings.length; i++) {
        if (textureBindings[i][0] === id) {
            gl.activeTexture(gl.TEXTURE0 + i);
            return i;
        }
    }

    // Texture isn't bound yet. We need to find an open binding

    for (let i = 0; i < textureBindings.length; i++) {
        if (textureBindings[i][0] === null) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            textureBindings[i] = [id, performance.now()];
            return i;
        }
    }

    // There is no open binding. We need to replace something that's already bound.
    {
        let minTime = Number.MAX_VALUE;
        let minTimeIdx = 0;
        for (let i = 0; i < textureBindings.length; i++) {
            const time = textureBindings[i][1];
            if (time < minTime) {
                minTime = time;
                minTimeIdx = i;
            }
        }
        gl.activeTexture(gl.TEXTURE0 + minTimeIdx);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        textureBindings[minTimeIdx] = [id, performance.now()];
        return minTimeIdx;
    }
}
