import * as Renderer from "./renderer"
import { Brand, Vec2 } from "../util"

// texture

export type Id = Brand<number, "TextureId">

export class Texture {
    constructor(
        readonly id: Id,
        readonly texture: WebGLTexture,
        readonly framebuffer: WebGLFramebuffer,
        private __size: Vec2
    ) {}

    get size(): Vec2 {
        return this.__size
    }

    updateSize(renderer: Renderer.Renderer, newSize: Vec2, textureIndex: number): void {
        const gl = renderer.gl
        this.__size = newSize

        gl.activeTexture(WebGLRenderingContext.TEXTURE0 + textureIndex)
        gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, this.texture)
        gl.texImage2D(
            WebGLRenderingContext.TEXTURE_2D,
            0,
            WebGLRenderingContext.RGBA,
            newSize.x,
            newSize.y,
            0,
            WebGLRenderingContext.RGBA,
            WebGLRenderingContext.FLOAT,
            null
        )
        gl.texParameteri(
            WebGLRenderingContext.TEXTURE_2D,
            WebGLRenderingContext.TEXTURE_MAG_FILTER,
            WebGLRenderingContext.LINEAR
        )
        gl.texParameteri(
            WebGLRenderingContext.TEXTURE_2D,
            WebGLRenderingContext.TEXTURE_MIN_FILTER,
            WebGLRenderingContext.LINEAR
        )
        gl.texParameteri(
            WebGLRenderingContext.TEXTURE_2D,
            WebGLRenderingContext.TEXTURE_WRAP_S,
            WebGLRenderingContext.CLAMP_TO_EDGE
        )
        gl.texParameteri(
            WebGLRenderingContext.TEXTURE_2D,
            WebGLRenderingContext.TEXTURE_WRAP_T,
            WebGLRenderingContext.CLAMP_TO_EDGE
        )
    }
}

// Manager

export interface Binding {
    readonly time: number
    readonly textureId: Id
}

export interface Bindings {
    [index: number]: Binding | null
}

const getNextTextureId: () => Id = (() => {
    let nextTextureId = 1
    return () => nextTextureId++ as Id
})()

export class TextureManager {
    readonly textures: Map<Id, Texture>
    readonly bindings: Bindings

    constructor(readonly textureSlots: number) {
        const bindings: Bindings = {}
        for (let i = 0; i < textureSlots; i++) bindings[i] = null

        this.bindings = bindings
        this.textures = new Map<Id, Texture>()
    }

    createTexture(renderer: Renderer.Renderer, size: Vec2): Texture {
        const gl = renderer.gl
        const webglTex = gl.createTexture()
        if (webglTex === null) throw "Failed to create texture"

        const framebuf = gl.createFramebuffer()
        if (framebuf === null) throw "Failed to create FrameBuffer"

        const texture = new Texture(getNextTextureId(), webglTex, framebuf, size)

        console.log("created texture with id", texture.id)

        texture.updateSize(renderer, size, 0)
        renderer.setFramebuffer(framebuf)
        renderer.gl.framebufferTexture2D(
            WebGLRenderingContext.FRAMEBUFFER,
            WebGLRenderingContext.COLOR_ATTACHMENT0,
            WebGLRenderingContext.TEXTURE_2D,
            webglTex,
            0
        )

        const frameBufferStatus = renderer.gl.checkFramebufferStatus(
            WebGLRenderingContext.FRAMEBUFFER
        )
        switch (frameBufferStatus) {
            case WebGLRenderingContext.FRAMEBUFFER_COMPLETE:
                break
            case WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                console.warn("FRAMEBUFFER_INCOMPLETE_ATTACHMENT ")
                break
            case WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                console.warn("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT ")
                break
            case WebGLRenderingContext.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                console.warn("FRAMEBUFFER_INCOMPLETE_DIMENSIONS ")
                break
            case WebGLRenderingContext.FRAMEBUFFER_UNSUPPORTED:
                console.warn("FRAMEBUFFER_UNSUPPORTED ")
                break
            default:
                throw "Unexpected status: " + frameBufferStatus
        }

        this.textures.set(texture.id, texture)

        return texture
    }

    bindTexture(gl: WebGLRenderingContext, texture: Texture): number {
        const preBoundIndex = this.textureBoundIndex(texture)
        if (preBoundIndex !== null) return preBoundIndex

        const index = this.getIndex()
        gl.activeTexture(WebGLRenderingContext.TEXTURE0 + index)
        gl.bindTexture(WebGLRenderingContext.TEXTURE_2D, texture.texture)
        this.bindings[index] = { textureId: texture.id, time: performance.now() }
        return index
    }

    deleteTexture(gl: WebGLRenderingContext, texture: Texture): void {
        this.textures.delete(texture.id)
        this.unbindTexture(texture.id)
        gl.deleteFramebuffer(texture.framebuffer)
        gl.deleteTexture(texture.texture)
    }

    private textureBoundIndex(texture: Texture): number | null {
        for (let i = 0; i < this.textureSlots; i++) {
            const binding = this.bindings[i]
            if (binding !== null && binding.textureId === texture.id) return i
        }
        return null
    }

    private getIndex(): number {
        for (let i = 0; i < this.textureSlots; i++) {
            if (this.bindings[i] === null) return i
        }

        const { bindings, textureSlots } = this
        let oldestIndex = 0
        let oldestTime = this.bindings[0]!.time

        for (let i = 1; i < textureSlots; i++) {
            if (oldestTime < bindings[i]!.time) continue
            oldestIndex = i
            oldestTime = bindings[i]!.time
        }
        return oldestIndex
    }

    private unbindTexture(id: Id): void {
        const { bindings, textureSlots } = this
        for (let i = 0; i < textureSlots; i++) {
            const binding = bindings[i]
            if (binding !== null && binding.textureId === id) {
                this.bindings[i] = null
                return
            }
        }
    }

    dispose(gl: WebGLRenderingContext): void {
        this.textures.forEach((texture, _key) => {
            gl.deleteFramebuffer(texture.framebuffer)
            gl.deleteTexture(texture.texture)
        })
    }
}
