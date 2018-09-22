import { LeafLayer, LayerId } from "canvas/layers"
import { Texture, TextureManager, TextureId } from "canvas/rendering/texture"
import { Renderer } from "canvas/rendering/renderer"
import { Vec2, Vec4 } from "canvas/util"

// I need a layerManager that keeps track of mappings between layerIds and textures
// combinedLayers can be a component of that manager

export interface FlattenedLayers {
    readonly above: ReadonlyArray<LeafLayer>
    readonly current: LeafLayer | null
    readonly below: ReadonlyArray<LeafLayer>
}

export interface UpdateArgs {
    readonly layerTextureMap: Map<LayerId, TextureId>
    readonly textureManager: TextureManager
    readonly renderer: Renderer
    readonly flattened: FlattenedLayers
    readonly size: Vec2
}

export class CombinedLayers {
    private previousFlattened: FlattenedLayers | null = null
    private size: Vec2
    readonly above: Texture
    readonly below: Texture
    private __current: Texture | null

    get current(): Texture | null {
        return this.__current
    }

    constructor(renderer: Renderer, size: Vec2) {
        this.__current = null
        this.above = renderer.createTexture(size)
        this.below = renderer.createTexture(size)
        this.size = size
    }

    update(updateArgs: UpdateArgs): void {
        const { flattened, size, textureManager, renderer } = updateArgs
        if (this.previousFlattened === flattened && this.size.eq(size)) return

        this.previousFlattened = flattened
        if (!this.size.eq(size)) {
            const aboveIdx = textureManager.bindTexture(renderer.gl, this.above)
            this.above.updateSize(renderer, size, aboveIdx)
            const belowIdx = textureManager.bindTexture(renderer.gl, this.below)
            this.below.updateSize(renderer, size, belowIdx)
            this.size = size
        }

        {
            // re-render above
            renderer.setFramebuffer(this.above.framebuffer)
            renderer.setViewport(new Vec4(0, 0, this.above.size.x, this.above.size.y))
            renderer.clear()
            const fabove = flattened.above
            for (let i = fabove.length - 1; i >= 0; i--) {
                const texture = getTextureForLayer(updateArgs, fabove[i].id)

                renderer.shaders.textureShader.render(renderer, {
                    resolution: texture.size,
                    textureIndex: renderer.bindTexture(texture),
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
            renderer.clear()
            const fbelow = flattened.below
            for (let i = fbelow.length - 1; i >= 0; i--) {
                const texture = getTextureForLayer(updateArgs, fbelow[i].id)

                renderer.shaders.textureShader.render(renderer, {
                    resolution: texture.size,
                    textureIndex: renderer.bindTexture(texture),
                    x0: 0,
                    y0: 0,
                    x1: texture.size.x,
                    y1: texture.size.y,
                })
            }
        }

        this.__current =
            flattened.current === null ? null : getTextureForLayer(updateArgs, flattened.current.id)
    }
}

function getTextureForLayer(
    { textureManager, layerTextureMap, renderer }: UpdateArgs,
    layerId: LayerId
): Texture {
    const currentTextureId = layerTextureMap.get(layerId)

    if (currentTextureId === undefined) {
        const texture = textureManager.createTexture(renderer, new Vec2(100, 100))
        layerTextureMap.set(layerId, texture.id)
        return texture
    }
    {
        const texture = textureManager.textures.get(currentTextureId)
        if (texture !== undefined) return texture
    }
    {
        const texture = textureManager.createTexture(renderer, new Vec2(100, 100))
        layerTextureMap.set(layerId, texture.id)
        return texture
    }
}
