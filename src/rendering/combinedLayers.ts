import * as Layers from "../layers"
import * as Texture from "./texture"
import * as Renderer from "./renderer"
import { Vec2, Vec4 } from "../util"
import { RgbLinear } from "../color"

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
    private __current: Texture.Texture | null

    get current(): Texture.Texture | null {
        return this.__current
    }

    constructor(renderer: Renderer.Renderer, size: Vec2) {
        this.layerTextureMap = new Map()
        this.__current = null
        this.above = renderer.createTexture(size)
        this.below = renderer.createTexture(size)
        this.size = size
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
            renderer.setFramebuffer(this.above.framebuffer)
            renderer.setViewport(new Vec4(0, 0, this.above.size.x, this.above.size.y))
            renderer.setClearColor(RgbLinear.Black, 0)
            renderer.clear()
            const fabove = flattened.above
            for (let i = fabove.length - 1; i >= 0; i--) {
                const texture = getTextureForLayer(updateArgs, layerTextureMap, fabove[i].id)

                renderer.shaders.textureShader.render(renderer, {
                    resolution: texture.size,
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
            renderer.setFramebuffer(this.below.framebuffer)
            renderer.setViewport(new Vec4(0, 0, this.below.size.x, this.below.size.y))
            renderer.setClearColor(RgbLinear.Black, 0)
            renderer.clear()
            const fbelow = flattened.below
            for (let i = fbelow.length - 1; i >= 0; i--) {
                const texture = getTextureForLayer(updateArgs, layerTextureMap, fbelow[i].id)

                renderer.shaders.textureShader.render(renderer, {
                    resolution: texture.size,
                    texture: texture,
                    x0: 0,
                    y0: 0,
                    x1: texture.size.x,
                    y1: texture.size.y,
                })
            }
        }

        this.__current =
            flattened.current === null
                ? null
                : getTextureForLayer(updateArgs, layerTextureMap, flattened.current.id)
    }
}

function getTextureForLayer(
    { renderer }: UpdateArgs,
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
