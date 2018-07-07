/* A stroke represents a sequence of BrushPoints
 * 
 * Due to performance concerns, we will store the Stroke in a mutable texture that we apply the BrushPoints to
 * 
 * The texture will be the size of the canvas, so we never need to resize it
 * It should however keep track of what area has been painted to (x0, y0, x1, y1)
 * 
 * When the stroke is ended, we blend the affected area with our current layer's texture
 * The the stroke texture needs to be cleared after usage so it's ready to the used again immediately.
 * 
 * 
 */

import { Texture } from "./texture"
import { BrushPoint, BrushShader } from "./brushShader"
import { Renderer } from "./renderer"
import { Vec2, Rgb } from "../../core"

export interface Area {
    readonly x0: number
    readonly y0: number
    readonly x1: number
    readonly y1: number
}

export interface AreaBuilder {
    x0: number
    y0: number
    x1: number
    y1: number
}

export class Stroke {
    static create(renderer: Renderer): Stroke | null {
        const shader = BrushShader.create(renderer.gl)
        if (shader === null) return null

        const texture = renderer.createTexture(renderer.getCanvasResolution())
        if (texture === null) return null

        const brushTexture = renderer.createTexture(new Vec2(128, 128))
        if (brushTexture === null) return null

        renderer.shaders.brushTextureGenerator.generateBrushTexture(
            renderer,
            { gamma: 1, softness: 0.4 },
            brushTexture
        )

        console.log(
            `stroke texture has id ${texture.id} and brush texture has id ${brushTexture.id}`
        )

        return new Stroke(shader, texture, brushTexture)
    }

    private affectedArea: AreaBuilder | null

    private constructor(
        readonly shader: BrushShader,
        readonly texture: Texture,
        readonly brushTexture: Texture
    ) {
        this.affectedArea = null
    }

    addPoints(brushPoints: ReadonlyArray<BrushPoint>): void {
        this.shader.addPoints(brushPoints)
        // TODO: calculate affected area
    }

    render(renderer: Renderer): void {
        const resolution = renderer.getCanvasResolution()
        const textureIndex = renderer.bindTexture(this.brushTexture)
        renderer.setFramebuffer(this.texture.framebuffer)
        this.shader.flush(renderer, { resolution, textureIndex })
    }

    clear(renderer: Renderer): void {
        this.affectedArea = null
        renderer.setFramebuffer(this.texture.framebuffer)
        renderer.setClearColor(Rgb.Black, 0)
        renderer.clear()
    }

    dispose(gl: WebGLRenderingContext): void {
        this.shader.dispose(gl)
    }
}
