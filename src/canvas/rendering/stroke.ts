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

import * as Texture from "./texture"
import * as BrushShader from "./brushShader"
import * as Renderer from "./renderer"
import * as Color from "canvas/color"
import { Vec2 } from "canvas/util"

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
    static create(renderer: Renderer.Renderer): Stroke | null {
        const shader = BrushShader.Shader.create(renderer.gl)
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

    private affectedArea: AreaBuilder | null = null

    private constructor(
        readonly shader: BrushShader.Shader,
        readonly texture: Texture.Texture,
        readonly brushTexture: Texture.Texture
    ) {}

    addPoints(brushPoints: ReadonlyArray<BrushShader.BrushPoint>): void {
        this.shader.addPoints(brushPoints)
        // TODO: calculate affected area
    }

    render(renderer: Renderer.Renderer): void {
        const resolution = renderer.getCanvasResolution()
        const textureIndex = renderer.bindTexture(this.brushTexture)
        renderer.setFramebuffer(this.texture.framebuffer)
        this.shader.flush(renderer, { resolution, textureIndex })
    }

    clear(renderer: Renderer.Renderer): void {
        this.affectedArea = null
        renderer.setFramebuffer(this.texture.framebuffer)
        renderer.setClearColor(Color.Rgb.Black, 0)
        renderer.clear()
    }

    dispose(gl: WebGLRenderingContext): void {
        this.shader.dispose(gl)
    }
}
