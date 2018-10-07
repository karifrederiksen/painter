import * as Layers from "../layers"
import * as Texture from "./texture"
import * as Renderer from "./renderer"
import * as Stroke from "./stroke"
import { Vec2, Vec4 } from "../util"
import * as Color from "../color"

// I need a layerManager that keeps track of mappings between layerIds and textures
// combinedLayers can be a component of that manager

export interface UpdateArgs {
    readonly renderer: Renderer.Renderer
    readonly flattened: Layers.SplitLayers
    readonly size: Vec2
}

export class CombinedLayers {
    private readonly layerTextureMap: Map<Layers.Id, Texture.Id>
    private previousFlattened: Layers.SplitLayers = { above: [], below: [], current: null }
    private size: Vec2
    readonly above: Texture.Texture
    readonly below: Texture.Texture
    readonly current: Texture.Texture
    private __currentOpacity: number

    get currentOpacity(): number {
        return this.__currentOpacity
    }

    constructor(renderer: Renderer.Renderer, size: Vec2) {
        this.layerTextureMap = new Map()
        this.current = renderer.createTexture(size)
        this.above = renderer.createTexture(size)
        this.below = renderer.createTexture(size)
        this.size = size
        this.__currentOpacity = 1
    }

    update(updateArgs: UpdateArgs): void {
        const { layerTextureMap } = this
        const { flattened, size, renderer } = updateArgs
        if (this.previousFlattened === flattened && this.size.eq(size)) return

        this.previousFlattened = flattened
        if (!this.size.eq(size)) {
            this.above.updateSize(renderer, size)
            this.below.updateSize(renderer, size)
            this.size = size
        }

        {
            // re-render above
            renderer.setViewport(new Vec4(0, 0, this.above.size.x, this.above.size.y))
            renderer.setClearColor(Color.RgbLinear.Black, 0)
            renderer.clear(this.above.framebuffer)
            const fabove = flattened.above
            for (let i = fabove.length - 1; i >= 0; i--) {
                const layer = fabove[i]
                if (layer.opacity === 0) continue

                const texture = getTextureForLayer(renderer, layerTextureMap, fabove[i].id)

                renderer.shaders.textureShader.render(renderer, {
                    opacity: layer.opacity,
                    resolution: texture.size,
                    framebuffer: this.above.framebuffer,
                    texture: texture,
                    x0: 0,
                    y0: 0,
                    x1: texture.size.x,
                    y1: texture.size.y,
                })
            }
        }

        {
            // re-render below
            renderer.setViewport(new Vec4(0, 0, this.below.size.x, this.below.size.y))
            renderer.setClearColor(Color.RgbLinear.Black, 0)
            renderer.clear(this.below.framebuffer)
            const fbelow = flattened.below
            for (let i = fbelow.length - 1; i >= 0; i--) {
                const layer = fbelow[i]
                if (layer.opacity === 0) continue

                const texture = getTextureForLayer(renderer, layerTextureMap, layer.id)

                renderer.shaders.textureShader.render(renderer, {
                    opacity: layer.opacity,
                    resolution: texture.size,
                    framebuffer: this.below.framebuffer,
                    texture: texture,
                    x0: 0,
                    y0: 0,
                    x1: texture.size.x,
                    y1: texture.size.y,
                })
            }
        }

        if (flattened.current === null) {
            this.__currentOpacity = 0
        } else {
            this.__currentOpacity = flattened.current.opacity
        }
    }

    applyStroke(renderer: Renderer.Renderer, resolution: Vec2, stroke: Stroke.Stroke): void {
        const flattened = this.previousFlattened
        if (flattened.current === null) {
            console.info("no current texture")
            return
        }

        renderer.setViewport(new Vec4(0, 0, resolution.x, resolution.y))
        renderer.setClearColor(Color.RgbLinear.Black, 0.0)
        renderer.clear(this.current.framebuffer)

        {
            // LAYER
            const layerTexture = getTextureForLayer(
                renderer,
                this.layerTextureMap,
                flattened.current.id
            )
            renderer.shaders.textureShader.render(renderer, {
                opacity: 1,
                resolution,
                framebuffer: this.current.framebuffer,
                texture: layerTexture,
                x0: 0,
                y0: 0,
                x1: resolution.x,
                y1: resolution.y,
            })
        }

        {
            // STROKE
            renderer.shaders.textureShader.render(renderer, {
                opacity: 1,
                resolution,
                framebuffer: this.current.framebuffer,
                texture: stroke.texture,
                x0: 0,
                y0: 0,
                x1: resolution.x,
                y1: resolution.y,
            })
        }
    }

    applyStrokeToUnderlying(
        renderer: Renderer.Renderer,
        resolution: Vec2,
        stroke: Stroke.Stroke
    ): void {
        const flattened = this.previousFlattened
        if (flattened.current === null) {
            console.info("no current texture")
            return
        }

        const layerTexture = getTextureForLayer(
            renderer,
            this.layerTextureMap,
            flattened.current.id
        )
        renderer.setViewport(new Vec4(0, 0, resolution.x, resolution.y))

        renderer.shaders.textureShader.render(renderer, {
            opacity: 1,
            resolution,
            framebuffer: layerTexture.framebuffer,
            texture: stroke.texture,
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })
    }
}

function getTextureForLayer(
    renderer: Renderer.Renderer,
    layerTextureMap: Map<Layers.Id, Texture.Id>,
    layerId: Layers.Id
): Texture.Texture {
    const currentTextureId = layerTextureMap.get(layerId)

    if (currentTextureId === undefined) {
        const texture = renderer.createTexture(new Vec2(100, 100))
        layerTextureMap.set(layerId, texture.id)
        return texture
    }
    {
        const texture = renderer.getTexture(currentTextureId)
        if (texture !== null) return texture
    }
    {
        const texture = renderer.createTexture(new Vec2(100, 100))
        layerTextureMap.set(layerId, texture.id)
        return texture
    }
}
